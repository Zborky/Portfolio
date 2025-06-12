using PrijmyAVydavky.Models;
using PrijmyAVydavky.Services;
using Plugin.LocalNotification;
using System.IO;
using Microsoft.Maui.Storage;

namespace PrijmyAVydavky
{
    public partial class MainPage : ContentPage
    {
        private readonly ExpenseDataBase _database; // Reference to the database for expenses
        private List<Expense> allExpenses = new(); // List to store all expenses

        public MainPage(ExpenseDataBase database) {
            InitializeComponent();
            _database = database; // Initialize the database instance
        }

        // Triggered when the page is displayed or redisplayed
        protected override async void OnAppearing() {
            base.OnAppearing();
            allExpenses = await _database.GetExpensesAsync(); // Load all expenses from the database

            FilterByMonth(); // Filter expenses for the current month
        }

        // Navigate to the page for adding a new expense
        private async void OnAddExpenseClicked(object sender, EventArgs e) {
            await Navigation.PushAsync(new AddExpensePage(_database));
        }

        // Handle category filter change
        private void OnCategoryFilterChanged(object sender, EventArgs e) {
            string selectedCategory = CategoryFilterPicker.SelectedItem?.ToString(); // Get selected category

            if (selectedCategory == "Všetko" || string.IsNullOrWhiteSpace(selectedCategory))
            {
                ExpensesCollectionView.ItemsSource = allExpenses; // Show all expenses if no specific category is selected
            }
            else {
                ExpensesCollectionView.ItemsSource = allExpenses
                   .Where(e => e.Category == selectedCategory) // Filter expenses by category
                   .ToList();
            }
        }

        // Handle tapping on an expense item
        private async void OnExpenseTapped(object sender, TappedEventArgs e) {
            if (e.Parameter is Expense tappedExpense) {
                bool confirm = await DisplayAlert(
                        "Zmazať výdavok?",
                        $"Naozaj chceš zmazať výdavok \"{tappedExpense.Name}\"?",
                        "Áno", "Nie"
                    ); // Confirm deletion

                if (confirm) {
                    await _database.DeleteExpenseAsync(tappedExpense); // Delete the expense
                    allExpenses = await _database.GetExpensesAsync(); // Reload expenses
                    ExpensesCollectionView.ItemsSource = allExpenses; // Update the view
                }
            }
        }

        // Update summary information for the selected month
        private async void UpdateSummary(List<Expense> expenses)
        {
            int month;
            if (MonthPicker.SelectedIndex <= 0)
            {
                month = DateTime.Now.Month; // Default to the current month
            }
            else
            {
                month = MonthPicker.SelectedIndex; // Use the selected month
            }

            int year = DateTime.Now.Year;

            var incomeData = await _database.GetIncomeForMonthAsync(year, month); // Retrieve income data for the month

            decimal income = 0;
            if (incomeData != null)
            {
                income = incomeData.Income; // Extract income value
            }

            decimal totalExpenses = 0;
            foreach (var expense in expenses)
            {
                totalExpenses += expense.Amount; // Calculate total expenses
            }

            decimal remaining = income - totalExpenses; // Calculate remaining balance

            decimal food = 0;
            decimal housing = 0;
            decimal entertainment = 0;

            // Categorize expenses
            foreach (var expense in expenses)
            {
                if (expense.Category == "Jedlo")
                {
                    food += expense.Amount;
                }
                else if (expense.Category == "Bývanie")
                {
                    housing += expense.Amount;
                }
                else if (expense.Category == "Zábava")
                {
                    entertainment += expense.Amount;
                }
            }

            if (remaining < 0)
            {
                RemainingLabel.TextColor = Colors.Red; // Highlight negative balance
                await DisplayAlert("Pozor!", "Si v mínuse! 😬", "Rozumiem");

                // Display notification for negative balance
                var request = new NotificationRequest
                {
                    NotificationId = 1001,
                    Title = "Zostatok pod nulou!",
                    Description = $"Tvoj mesačný rozpočet je prečerpaný o {Math.Abs(remaining):C}.",
                    Schedule = new NotificationRequestSchedule
                    {
                        NotifyTime = DateTime.Now.AddSeconds(1) // Notify immediately
                    }
                };

                await LocalNotificationCenter.Current.Show(request);
            }
            else { 
                RemainingLabel.TextColor = Colors.Green; // Highlight positive balance
            }

            // Update category summaries
            FoodSummaryLabel.Text = "Jedlo: " + food.ToString("C");
            HousingSummaryLabel.Text = "Bývanie: " + housing.ToString("C");
            EntertainmentSummaryLabel.Text = "Zábava: " + entertainment.ToString("C");

            // Display remaining balance
            if (RemainingLabel == null)
            {
                RemainingLabel = new Label { FontAttributes = FontAttributes.Bold };
                SummaryLayout.Children.Add(RemainingLabel);
            }

            RemainingLabel.Text = "Zostatok: " + remaining.ToString("C") + " z príjmu " + income.ToString("C");
        }

        // Filter expenses by the selected month
        private void FilterByMonth() {
            int selectedMonth = MonthPicker.SelectedIndex;
            List<Expense> filtered;

            if (selectedMonth <= 0)
            {
                // Default to current month
                int currentMonth = DateTime.Now.Month;
                filtered = allExpenses
            .Where(e => e.Date.Month == currentMonth && e.Date.Year == DateTime.Now.Year)
            .ToList();
            }
            else { 
                filtered = allExpenses
                    .Where(e => e.Date.Month == selectedMonth && e.Date.Year == DateTime.Now.Year)
                    .ToList();
            }

            ExpensesCollectionView.ItemsSource = filtered; // Update displayed expenses

            UpdateSummary(filtered); // Update summary data
        }

        // Triggered when the selected month changes
        private void OnMonthChanged(object sender, EventArgs e){
            FilterByMonth();
        }

        // Save the income for the selected month
        private async void OnSaveIncomeClicked(object sender, EventArgs e)
        {
            if (decimal.TryParse(IncomeEntry.Text, out decimal income)) {
                var month = MonthPicker.SelectedIndex <= 0 ? DateTime.Now.Month : MonthPicker.SelectedIndex;
                var incomeData = new MonthlyIncome
                {
                    Year = DateTime.Now.Year,
                    Month = month,
                    Income = income,
                };

                await _database.SaveMonthlyIncomeAsync(incomeData); // Save the income data
                await DisplayAlert("Hotovo", "Prijem bol ulozeny", "Ok"); // Confirm save

                FilterByMonth(); // Refresh data
            }
        }
    }
}