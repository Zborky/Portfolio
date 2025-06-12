using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.OS;

namespace CasNaSpanok
{
    [Activity(Theme = "@style/Maui.SplashTheme", MainLauncher = true, LaunchMode = LaunchMode.SingleTop,
              ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation |
                                     ConfigChanges.UiMode | ConfigChanges.ScreenLayout |
                                     ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
    public class MainActivity : MauiAppCompatActivity
    {
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            // Make notification channel
            if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
            {
                var channel = new NotificationChannel("default", "General", NotificationImportance.High);
                var manager = (NotificationManager)Android.App.Application.Context.GetSystemService(Context.NotificationService);
                manager.CreateNotificationChannel(channel);
            }

           
        }
    }
}
