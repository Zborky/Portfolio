using Microsoft.Maui.Controls;
using Plugin.LocalNotification;
using Microsoft.Maui.Storage;
using System.Text.Json;

#if ANDROID
using Android;
using Android.Content.PM;
using AndroidX.Core.App;
using AndroidX.Core.Content;
using CasNaSpanok.Platforms.Android;
#endif

namespace CasNaSpanok;

public partial class MainPage : ContentPage
{
    // List to store reminders
    private List<Reminder> reminders = new();

    public MainPage()
    {
        InitializeComponent();

        // Set default date for DatePicker to today
        reminderDatePicker.Date = DateTime.Today;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        LoadReminders(); // Load saved reminders

#if ANDROID
        try
        {
            var activity = Platform.CurrentActivity;

            // Check and request notification permissions on Android
            if (ContextCompat.CheckSelfPermission(activity, Manifest.Permission.PostNotifications) != Permission.Granted)
            {
                ActivityCompat.RequestPermissions(activity, new string[] { Manifest.Permission.PostNotifications }, 0);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("❌ CHYBA Platform.CurrentActivity: " + ex.Message);
        }
#endif

        // Load saved notification time into the TimePicker
        if (Preferences.ContainsKey("CasNaNotifikaciu"))
        {
            var storedTime = Preferences.Get("CasNaNotifikaciu", "22:00:00");
            if (TimeSpan.TryParse(storedTime, out var parsedTime))
            {
                timePicker.Time = parsedTime;
            }
        }
    }

    private void OnSetNotificationClicked(object sender, EventArgs e)
    {
        var selectedTime = timePicker.Time;
        Preferences.Set("CasNaNotifikaciu", selectedTime.ToString()); // Save notification time

        var now = DateTime.Now;
        var notifyTime = new DateTime(now.Year, now.Month, now.Day, selectedTime.Hours, selectedTime.Minutes, 0);

        if (notifyTime <= now)
            notifyTime = notifyTime.AddDays(1); // If the time has passed, set for the next day

        // Show notification for testing purposes
        var notification = new NotificationRequest
        {
            NotificationId = 100,
            Title = "Je čas ísť spať",
            Description = "Nezabudni vypiť pohár vody. 💧",
            Schedule = new NotificationRequestSchedule
            {
                NotifyTime = notifyTime,
                RepeatType = NotificationRepeat.Daily
            }
        };

        LocalNotificationCenter.Current.Show(notification);

#if ANDROID
        // Use AlarmManager for persistent notifications even when the app is closed
        try
        {
            AlarmScheduler.ScheduleNotification(
                "Je čas ísť spať",
                "Nezabudni vypiť pohár vody. 💧",
                notifyTime
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("❌ CHYBA AlarmScheduler: " + ex.Message);
        }
#endif
    }

    private void OnAddReminderClicked(object sender, EventArgs e)
    {
        var text = reminderEntry.Text; // Get reminder text
        var date = reminderDatePicker.Date; // Get selected date
        var time = reminderTimePicker.Time; // Get selected time
        var now = DateTime.Now;

        if (string.IsNullOrWhiteSpace(text)) // Validate reminder text
        {
            DisplayAlert("Chyba", "Zadaj text pripomienky.", "OK");
            return;
        }

        var notifyTime = new DateTime(date.Year, date.Month, date.Day, time.Hours, time.Minutes, 0);

        if (notifyTime <= now) // Ensure the reminder is set for the future
        {
            DisplayAlert("Chyba", "Zadaný čas je v minulosti!", "OK");
            return;
        }

        // Create new reminder object
        var reminder = new Reminder
        {
            Text = text,
            Time = notifyTime.ToString("dd.MM.yyyy HH:mm"),
            NotifyDateTime = notifyTime
        };

        reminders.Add(reminder); // Add to reminders list

        remindersListView.ItemsSource = null; // Refresh ListView
        remindersListView.ItemsSource = reminders;

        SaveReminders(); // Save updated reminders list

#if ANDROID
        // Schedule notification for the reminder
        AlarmScheduler.ScheduleNotification(text, "Pripomienka", notifyTime);
#endif

        reminderEntry.Text = ""; // Clear input field
    }

    private void SaveReminders()
    {
        var json = JsonSerializer.Serialize(reminders); // Serialize reminders to JSON
        Preferences.Set("Reminders", json); // Save JSON to preferences
    }

    private void LoadReminders()
    {
        if (Preferences.ContainsKey("Reminders")) // Check if reminders exist
        {
            var json = Preferences.Get("Reminders", "");
            if (!string.IsNullOrEmpty(json))
            {
                try
                {
                    reminders = JsonSerializer.Deserialize<List<Reminder>>(json) ?? new(); // Deserialize reminders
                    remindersListView.ItemsSource = reminders; // Load into ListView
                    System.Diagnostics.Debug.WriteLine($"🔁 Načítané pripomienky: {reminders.Count}");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("❌ Chyba pri načítavaní: " + ex.Message);
                }
            }
        }
    }

    [Obsolete] // Marked as obsolete for future compatibility
    private void OnReminderSelected(object sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is Reminder selectedReminder)
        {
            Device.BeginInvokeOnMainThread(async () =>
            {
                // Confirm deletion of the selected reminder
                bool confirm = await DisplayAlert(
                    "Vymazať pripomienku",
                    $"Chceš vymazať: \"{selectedReminder.Text}\"?",
                    "Áno", "Nie");

                if (confirm)
                {
                    reminders.Remove(selectedReminder); // Remove from list
                    remindersListView.ItemsSource = null; // Refresh ListView
                    remindersListView.ItemsSource = reminders;
                    SaveReminders(); // Save updated reminders list
                }

                ((CollectionView)sender).SelectedItem = null; // Deselect item
            });
        }
    }
}
