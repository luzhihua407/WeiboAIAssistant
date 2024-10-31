use std::env;
// use std::error::Error;
// use std::process::Command;

use tauri::{menu::{Menu, MenuItem}, tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent}, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
// Function to spawn the Express server
// fn start_server() -> Result<(), Box<dyn Error>> {
//     let _output = tauri::async_runtime::block_on(async move {
//         Command::new("main")
//             .spawn()
//             .expect("Failed to start Express server");
//     });

//     Ok(())
// }
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {


    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argss,_cwdd| {
            let _ = app.get_webview_window("main")
                       .expect("no main window")
                       .set_focus();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::Folder {
                path: std::path::PathBuf::from("d:/logs"),
                file_name: None,
              },
          )).build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .setup(|app: &mut tauri::App| {
        //     // Run the Express server based on environment
        //     if let Err(err) = start_server() {
        //         eprintln!("Failed to start Express server: {}", err);
        //     }
        //     Ok(())
        // })
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            TrayIconBuilder::new()
            .menu(&menu)
            .menu_on_left_click(false)
            .on_menu_event(|app, event| match event.id.as_ref() {
                "quit" => {
                  println!("quit menu item was clicked");
                  app.exit(0);
                }
                _ => {
                  println!("menu item {:?} not handled", event.id);
                }
              })
            .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up|MouseButtonState::Down,
                ..
                } => {
                    println!("left click pressed and released");
                    // in this example, let's show and focus the main window when the tray is clicked
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    }
                }
                _ => {
                    println!("unhandled event {event:?}");
                }
                })
            .icon(app.default_window_icon().unwrap().clone())
            .build(app)?;
            Ok(())
            })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
