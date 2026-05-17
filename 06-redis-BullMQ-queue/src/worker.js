import {Worker} from 'bullmq';
import {emailQueue, connection} from './queue.js';

const emailWorker = new Worker(
    'emails',
    async job => {
        console.log('Processing email job:', job.id, job.name, job.data);
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Email sent to:', job.data.to);
    }, 
    { connection }
);

emailWorker.on('completed', job => {
    console.log(`Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err);
});