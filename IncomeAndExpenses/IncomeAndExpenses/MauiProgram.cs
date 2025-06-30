using Microsoft.Extensions.Logging;
using Plugin.LocalNotification;
using PrijmyAVydavky.Services;

namespace PrijmyAVydavky
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .UseLocalNotification()

                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

            string dbpath = Path.Combine(FileSystem.AppDataDirectory, "expenses.db3");
            builder.Services.AddSingleton(new ExpenseDataBase(dbpath));
#if DEBUG
    		builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
