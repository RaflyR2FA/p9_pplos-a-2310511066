const amqp = require('amqplib');
const { Booking } = require('../database/models');

async function startWorker() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('ticket_queue');
    console.log('Worker aktif, mendengarkan antrean ticket_queue...');
    channel.consume('ticket_queue', async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            console.log(`[Worker] Memproses booking ID: ${data.booking_id}`);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); 
                await Booking.update(
                    { status: 'Paid' }, 
                    { where: { id: data.booking_id } }
                );
                console.log(`[Worker] Selesai memproses booking ID: ${data.booking_id}. Status: Paid`);
                channel.ack(msg);
            } catch (error) {
                console.error('[Worker] Gagal memproses pesan', error);
                channel.nack(msg); 
            }
        }
    });
}

startWorker();