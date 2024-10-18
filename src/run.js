import { Command } from '@tauri-apps/plugin-shell';


const command = Command.sidecar('bin/main');
const output = await command.execute();