use std::{error::Error, process::Command};

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

// Function to spawn the Express server using pm2
fn start_server() -> Result<(), Box<dyn Error>> {
    let _output = tauri::async_runtime::block_on(async move {
        Command::new("pm2")
            .args(&["start", "backend/src/app.js", "--name", "backend"])
            .spawn()
            .expect("Failed to start backend server with pm2");
    });

    Ok(())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]) /* arbitrary number of args to pass to your app */))
        .plugin(tauri_plugin_single_instance::init(|app, _argss, _cwdd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Folder {
                        path: std::path::PathBuf::from("d:/logs"),
                        file_name: None,
                    },
                ))
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|_| {
            // Run the Express server based on environment
            if let Err(err) = start_server() {
                eprintln!("Failed to start Express server: {}", err);
            }
            Ok(())
        })
        .setup(|app| {
            #[cfg(desktop)]
            {
                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                let _ = autostart_manager.enable();
                // Check enable state
                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );
            }
            Ok(())
        })
        .setup(|app| {
            // 创建托盘菜单
            // let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            // let menu = Menu::with_items(app, &[&quit_i])?;

            // 创建托盘图标
            TrayIconBuilder::new().show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("退出菜单项被点击");
                        app.exit(0);
                    }
                    _ => {
                        println!("未处理的菜单项: {:?}", event.id);
                    }
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up | MouseButtonState::Down,
                        ..
                    } => {
                        println!("左键点击托盘图标");
                        // 显示并聚焦主窗口
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {
                        println!("未处理的事件: {event:?}");
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
