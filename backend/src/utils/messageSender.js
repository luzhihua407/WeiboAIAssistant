import { emitMessage } from '#root/utils/socket.js';

async function sendNotification(event, data) {
  emitMessage(event, data);
}

export default sendNotification;
  