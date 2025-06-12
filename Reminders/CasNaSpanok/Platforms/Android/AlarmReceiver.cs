using Android.App;
using Android.Content;
using Android.OS;
using AndroidX.Core.App;

namespace CasNaSpanok.Platforms.Android;

[BroadcastReceiver(Enabled = true, Exported = true)]
public class AlarmReceiver : BroadcastReceiver
{
    public override void OnReceive(Context context, Intent intent)
    {
        // Retrieve the title and message for the notification from the intent extras
        string title = intent.GetStringExtra("title") ?? "Pripomienka";
        string message = intent.GetStringExtra("message") ?? "";

        // ⛳ Create a NotificationChannel (only required once, for API 26+)
        var channelId = "default";
        if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
        {
            var channelName = "General Notifications"; // Channel name displayed in settings
            var channel = new NotificationChannel(channelId, channelName, NotificationImportance.High);
            var notificationManager = (NotificationManager)context.GetSystemService(Context.NotificationService);
            notificationManager.CreateNotificationChannel(channel); // Register the channel
        }

        // Build the notification with title, message, and other properties
        var builder = new NotificationCompat.Builder(context, channelId)
            .SetContentTitle(title) // Set the notification title
            .SetContentText(message) // Set the notification message
            .SetSmallIcon(Resource.Drawable.notification_icon_background) // Use a small icon for the notification
            .SetPriority((int)NotificationPriority.High) // Set notification priority to high
            .SetAutoCancel(true); // Automatically dismiss the notification when tapped

        // Show the notification using NotificationManagerCompat
        NotificationManagerCompat.From(context).Notify(new Random().Next(), builder.Build());
    }
}
