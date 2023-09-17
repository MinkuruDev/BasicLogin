use serde::{Serialize, Deserialize};
use std::{fs::File, path::Path};
use std::io::{Read, Write};
use toml;

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct StoredUser{
    pub(crate) username: String,
    pub(crate) hashed_password: String,
    pub(crate) attemp: u8
}

pub(crate) fn get_user(username: &String) -> Option<StoredUser> {
    let path = format!("data/{}.toml", username);
    let path = Path::new(&path);

    // Open the path in read-only mode, returns `io::Result<File>`
    let mut file = match File::open(&path) {
        Err(_) => return None,
        Ok(file) => file,
    };

    // Read the file contents into a string, returns `io::Result<usize>`
    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Err(_) => return None,
        Ok(_) => (),
    }

    Some(toml::from_str::<StoredUser>(&s).unwrap())
}

pub(crate) fn set_user(data: &StoredUser){
    let toml_data = match toml::to_string(data) {
        Ok(val) => val,
        Err(why) => {
            println!("Cannot parse data to toml: {}", why);
            "".to_owned()
        }
    };
    let path = format!("data/{}.toml", data.username);
    let mut f = File::create(&path).unwrap();
    f.write_all(toml_data.as_bytes()).unwrap_or(());
}
