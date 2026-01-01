const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const checkDueDates = async () => {
    try {
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

        // Define range for "2 days from now" (e.g., matching the day)
        // For simplicity, we'll look for tasks due BEFORE twoDaysFromNow but NOT YET completed/canceled/reminded
        // A better approach might be checking if due_date is between now and 2 days from now?
        // User request: "two days before the due date" -> means (DueDate - Now) <= 2 days

        // Let's query tasks where:
        // 1. Status is NOT 'Completed' or 'Canceled'
        // 2. reminder_sent is false
        // 3. due_date exists
        // 4. due_date is less than or equal to twoDaysFromNow
        // 5. due_date is greater than now (optional, to avoid reminding for past overdue tasks immediately if we only want "approaching" deadline, but overdue tasks should probably also be reminded)

        const tasks = await Task.find({
            status: { $nin: ['Completed', 'Canceled'] },
            reminder_sent: false,
            due_date: { $exists: true, $ne: null, $lte: twoDaysFromNow, $gt: now }
        });

        console.log(`[Reminder Service] Found ${tasks.length} tasks due soon.`);

        for (const task of tasks) {
            // Create Notification
            const notification = new Notification({
                recipient: task.receiver,
                sender: task.sender, // Or system? using sender makes sense contextually
                type: 'due_soon',
                message: `Task "${task.title}" is due in less than 2 days. Please complete it soon!`,
                relatedId: task._id,
                onModel: 'Task'
            });

            await notification.save();

            // Mark reminder as sent
            task.reminder_sent = true;
            await task.save();
        }

    } catch (error) {
        console.error('[Reminder Service] Error checking due dates:', error);
    }
};

// Schedule: Run every hour
// '0 * * * *' = every hour at minute 0
const initReminderService = () => {
    console.log('[Reminder Service] Initialized. Running checks every hour.');

    // For testing/demonstration purposes, we can run it immediately on startup
    checkDueDates();

    cron.schedule('0 * * * *', () => {
        console.log('[Reminder Service] Running automated check...');
        checkDueDates();
    });
};

module.exports = initReminderService;
