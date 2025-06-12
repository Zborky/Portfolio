// Pripojenie namespaces – model Expense a databázová sluba
using PrijmyAVydavky.Models;
using PrijmyAVydavky.Services;

namespace PrijmyAVydavky
{
    // Trieda pre stránku na pridávanie vıdavkov
    public partial class AddExpensePage : ContentPage
    {
        // Inštancia databázy, cez ktorú zapisujeme vıdavok
        private readonly ExpenseDataBase _database;

        // Konštruktor – prijíma inštanciu databázy (z Dependency Injection)
        public AddExpensePage(ExpenseDataBase database)
        {
            InitializeComponent(); // inicializuje XAML komponenty
            _database = database;  // uloí databázu do súkromnej premennej
        }

        // Event handler pre kliknutie na tlaèidlo "Uloi vıdavok"
        private async void OnSaveClicked(object sender, EventArgs e)
        {
            // Validácia – ak je názov alebo suma prázdna, zobrazí sa upozornenie
            if (string.IsNullOrWhiteSpace(NameEntry.Text) || string.IsNullOrWhiteSpace(AmountEntry.Text))
            {
                await DisplayAlert("Chyva", "Vypln vsetky prazdne polia.", "Ok");
                return;
            }

            // Kontrola èi je suma platné èíslo (desatinné èíslo)
            if (!decimal.TryParse(AmountEntry.Text, out decimal amount))
            {
                await DisplayAlert("Chyba", "Zadaj platnú sumu.", "OK");
                return;
            }

            // Vytvorenie novej inštancie vıdavku na základe vstupov z formulára
            var newExpense = new Expense
            {
                Name = NameEntry.Text,
                Amount = amount,
                Category = CategoryPicker.SelectedItem?.ToString() ?? "Nezadana",
                Date = DateTime.Now 
            };

            // Uloenie vıdavku do databázy
            await _database.SaveExpenseAsync(newExpense);

            // Zobrazenie potvrdenia
            await DisplayAlert("Hotovo", "Vıdavok bol uloenı.", "OK");

            // Návrat spä na predchádzajúcu stránku (napr. MainPage)
            await Navigation.PopAsync();
        }
    }
}
