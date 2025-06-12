using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PrijmyAVydavky.Models;
using SQLite;

namespace PrijmyAVydavky.Services
{
    public class ExpenseDataBase {
        private readonly SQLiteAsyncConnection _database;

        public ExpenseDataBase(string dbpath) {
            // Initialize the database connection and create tables if they do not exist
            _database = new SQLiteAsyncConnection(dbpath);
            _database.CreateTableAsync<Expense>().Wait();
            _database.CreateTableAsync<MonthlyIncome>().Wait();
        }

        // Retrieve all expenses from the database, sorted by date in descending order
        public Task<List<Expense>> GetExpensesAsync() {
            return _database.Table<Expense>().OrderByDescending(e => e.Date).ToListAsync();    
        }

        // Save or update an expense in the database
        public Task<int> SaveExpenseAsync(Expense expense)
        {
            if (expense.Id != 0)
                return _database.UpdateAsync(expense); // Update the expense if it already exists
            return _database.InsertAsync(expense);     // Insert a new expense otherwise
        }

        // Delete an expense from the database
        public Task<int> DeleteExpenseAsync(Expense expense)
        {
            return _database.DeleteAsync(expense);
        }

        // Save or update monthly income information in the database
        public Task<int> SaveMonthlyIncomeAsync(MonthlyIncome income) {
            return _database.InsertOrReplaceAsync(income);
        }

        // Retrieve income data for a specific month and year
        public Task<MonthlyIncome?> GetIncomeForMonthAsync(int year, int month) {
            return _database.Table<MonthlyIncome>()
                .Where(i => i.Year == year && i.Month == month)
                .FirstOrDefaultAsync();
        }

        // Get aggregated monthly expenses for a specific year
        public async Task<Dictionary<string, decimal>> GetMonthlyExpensesAsync(int year)
        {
            // Retrieve all expenses for the specified year
            var expenses = await _database.Table<Expense>()
                .Where(e => e.Date.Year == year)
                .ToListAsync();

            // Group expenses by month and calculate total amounts for each month
            return expenses
                .GroupBy(e => e.Date.Month)
                .ToDictionary(
                    g => new DateTime(year, g.Key, 1).ToString("MMMM", new System.Globalization.CultureInfo("sk-SK")), // Month name in Slovak
                    g => g.Sum(e => e.Amount) // Total amount for the month
                );
        }
    }
}
