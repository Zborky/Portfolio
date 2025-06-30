using Android.App;
using Android.Content;
using Android.OS;
using System;
using CasNaSpanok;

namespace CasNaSpanok.Platforms.Android
{
    public static class AlarmScheduler
    {
        public static void ScheduleNotification(string title, string message, DateTime time)
        {
            // Get the application context
            var context = global::Android.App.Application.Context;

            // Create an intent to invoke the AlarmReceiver
            var intent = new Intent(context, typeof(AlarmReceiver));
            intent.PutExtra("title", title); // Pass the notification title as an extra
            intent.PutExtra("message", message); // Pass the notification message as an extra

            // Create a PendingIntent to be triggered at the scheduled time
            var pendingIntent = PendingIntent.GetBroadcast(
                context,
                0, // Request code, can be used to identify the intent
                intent,
                PendingIntentFlags.Immutable | PendingIntentFlags.UpdateCurrent // Ensure immutability and update if already exists
            );

            // Get the AlarmManager service to schedule the alarm
            var alarmManager = (AlarmManager)context.GetSystemService(Context.AlarmService);

            // Calculate the trigger time in milliseconds since Unix epoch
            var triggerTime = (long)(time.ToUniversalTime() - DateTime.UnixEpoch).TotalMilliseconds;

            if (Build.VERSION.SdkInt >= BuildVersionCodes.S) // API level 31+ specific handling
            {
                // Use SetExactAndAllowWhileIdle for precise timing even in idle mode
                alarmManager.SetExactAndAllowWhileIdle(AlarmType.RtcWakeup, triggerTime, pendingIntent);
            }
            else // For older Android versions
            {
                // Use SetExact for precise timing
                alarmManager.SetExact(AlarmType.RtcWakeup, triggerTime, pendingIntent);
            }
        }
    }
}
