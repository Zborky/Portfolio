using System;

public class Calendar
{
    private int mesiac;            // Month number
    private int rok;               // Year
    private string nazovMesiaca;   // Name of the month
    private int[,] kalendar;       // 2D array to hold calendar days

    private int maxDni;            // Maximum days in the month
    private int zaciatokKalendaru; // Start day of the calendar (0 = Monday)

    /*
    Constructor that initializes the calendar object with a specified month and year.
    It determines the number of days in the month, the starting day of the month, 
    and the month's name.
    */
    public Calendar(int mesiac, int rok)
    {
        this.mesiac = mesiac;
        this.rok = rok;
        this.kalendar = new int[6, 7]; 
        this.zaciatokKalendaru = UrciZaciatokDna();  // Determine starting day of the week
        UrciMaxDni();                                // Determine max days in the month
        UrciMesiac();                                // Determine name of the month
    }

    /* 
     Determines whether the given year is a leap year.
     A year is a leap year if it is divisible by 4 but not divisible by 100,
     or if it is divisible by 400.
    */
    public bool jePriestupny()
    {
        return (rok % 4 == 0 && rok % 100 != 0) || rok % 400 == 0;
    }
    /*
   
     Determines the maximum number of days in the given month for the given year.
     Accounts for leap years when calculating the days in February.
    
     */
    private void UrciMaxDni()
    {
        switch (mesiac)
        {
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                maxDni = 31;
                break;
            case 4: case 6: case 9: case 11:
                maxDni = 30;
                break;
            case 2:
                maxDni = jePriestupny() ? 29 : 28;
                break;
            default:
                maxDni = 0; // Invalid month
                break;
        }
    }
    /*    
     Determines the name of the month based on its numeric value.   
     */
    private void UrciMesiac()
    {
        switch (mesiac)
        {
            case 1: nazovMesiaca = "Január"; break;
            case 2: nazovMesiaca = "Február"; break;
            case 3: nazovMesiaca = "Marec"; break;
            case 4: nazovMesiaca = "Apríl"; break;
            case 5: nazovMesiaca = "Máj"; break;
            case 6: nazovMesiaca = "Jún"; break;
            case 7: nazovMesiaca = "Júl"; break;
            case 8: nazovMesiaca = "August"; break;
            case 9: nazovMesiaca = "September"; break;
            case 10: nazovMesiaca = "Október"; break;
            case 11: nazovMesiaca = "November"; break;
            case 12: nazovMesiaca = "December"; break;
            default: nazovMesiaca = "Neznámy mesiac"; break; // Unknown month
        }
    }
    /*
     <summary>
     Determines the starting day of the month using Zeller's Congruence formula.
     Adjusts the result so that Monday is considered the first day of the week.
     </summary>
    /// 
    */
    private int UrciZaciatokDna()
    {
        int m = mesiac;
        int y = rok;

        // Adjust month and year for January and February
        if (m == 1 || m == 2)
        {
            m += 12;
            y--;
        }

        int k = y % 100;     // Year within century
        int j = y / 100;     // Zero-based century
        // Zeller's formula to find day of week (0=Saturday,...)
        int h = (1 + (13 * (m + 1)) / 5 + k + k / 4 + j / 4 - 2 * j) % 7;
        return (h + 5) % 7;  // Adjust so 0 = Monday, ..., 6 = Sunday
    }

    /*
     Displays the calendar for the given month and year.
     Includes the header and day numbers, formatted to align correctly.
    */
    public void ZobrazKalendar()
    {
        Console.WriteLine($"Rok: {rok}");
        Console.WriteLine($"Mesiac: {nazovMesiaca}");
        Console.WriteLine("Po Ut St Št Pi So Ne"); // Days of the week (Mon-Sun)

        int d = 1;
        for (int i = 0; i < 6; i++) // 6 rows to cover all possible weeks
        {
            for (int j = 0; j < 7; j++) // 7 days per week
            {
                // Print empty spaces before the start of the month
                if (i == 0 && j < zaciatokKalendaru)
                {
                    Console.Write("   "); // Empty space for alignment
                }
                else if (d <= maxDni)
                {
                    Console.Write($"{d,2} ");  // Print day with 2-character width
                    kalendar[i, j] = d;        // Store day in calendar array
                    d++;
                }
                else
                {
                    Console.Write("   ");      // Empty space after last day
                }
            }
            Console.WriteLine();
            if (d > maxDni) break; // Stop printing once all days are shown
        }
    }

   /* <summary>
     Main entry point of the program.
     Prompts the user for a month and year, then displays the corresponding calendar.
    */
    public static void Main(string[] args)
    {
        Console.Write("Zadajte mesiac (1-12): ");
        int mesiac = int.Parse(Console.ReadLine() ?? "1");

        Console.Write("Zadajte rok: ");
        int rok = int.Parse(Console.ReadLine() ?? "2023");

        Calendar kalendar = new Calendar(mesiac, rok);
        kalendar.ZobrazKalendar();
    }
    
}
