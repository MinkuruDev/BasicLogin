#[macro_use] extern crate rocket;
mod db; use db as database;
use database::StoredUser;
use rocket::http::{CookieJar, Cookie};
use rocket::response::status::Unauthorized;

use std::collections::HashMap;

use rocket::response::{Flash, Redirect};
use rocket::form::Form;
use rocket::fs::FileServer;

use sha256::digest;

#[derive(FromForm)]
struct LoginForm {
    username: String,
    password: String,
}

#[get("/")]
fn index() -> Redirect {
    Redirect::to("index.html")
}

#[post("/register", data = "<form>")]
fn register_submit(form: Form<LoginForm>, cookies: &CookieJar<'_>) -> Result<Flash<Redirect>, Unauthorized<String>> {
    let user = database::get_user(&form.username);
    match user {
        Some(_) => return Err(Unauthorized(Some("Username already exist".to_owned()))),
        None => ()
    };

    let user = StoredUser{
        username: (&form.username).to_owned(),
        hashed_password: digest(&form.password),
        attemp: 0
    };

    database::set_user(&user);
    cookies.add(Cookie::new("userauth", user.username));
    Ok(Flash::success(Redirect::to("/index.html"), ""))
}

#[post("/login", data = "<login_form>")]
fn login_submit(login_form: Form<LoginForm>, cookies: &CookieJar<'_>) -> Result<Flash<Redirect>, Unauthorized<String>> {
    let user = database::get_user(&login_form.username);
    let mut user = match user {
        Some(data) => data,
        None => return Err(Unauthorized(Some("Invalid Username Or Password".to_owned())))
    };

    if user.attemp >= 5 {
        return Err(Unauthorized(Some("The account is locked due to many failed attemp".to_owned())));
    }

    if user.hashed_password != digest(&login_form.password) {
        user.attemp += 1;
        database::set_user(&user);
        return Err(Unauthorized(Some("Invalid Username Or Password".to_owned())))
    }
    user.attemp = 0;
    database::set_user(&user);
    cookies.add(Cookie::new("userauth", user.username));
    Ok(Flash::success(Redirect::to("/index.html"), ""))
}

fn init_user(users : &mut HashMap<String, String>){
    users.insert("admin".to_owned(), digest("Strong69Password;"));

    for (username, password) in users.iter() {
        db::set_user(&StoredUser{
            hashed_password: password.to_owned(),
            username: username.to_owned(),
            attemp: 0
        });
    }
}

#[launch]
fn rocket() -> _ {
    let mut users : HashMap::<String, String> = HashMap::new();
    init_user(&mut users);
    rocket::build()
        .mount("/", FileServer::from("statics"))
        .mount("/", routes![index, register_submit, login_submit])
        .manage(users)
}
