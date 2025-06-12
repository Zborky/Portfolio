using System;




    // Class for analyze text
    public class TextAnalyzer
    {
        // Atributes
        public string InputText { get; set; }
        public int CharacterCount { get; private set; }
        public int WordCount { get; private set; }
        public int SpaceCount { get; private set; }

        // Constructor
        public TextAnalyzer(string inputText)
        {
            InputText = inputText;
            AnalyzeText();
        }

        // Method for Analyze text
        private void AnalyzeText()
        {
            // Char counter
            CharacterCount = InputText.Length;

            // Word counter
            string[] words = InputText.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            WordCount = words.Length;

            // BackSpace counter
            SpaceCount = 0;
            foreach (char c in InputText)
            {
                if (c == ' ')
                {
                    SpaceCount++;
                }
            }
        }

        //Method for display Results
        public void DisplayResults()
        {
            Console.WriteLine($"Počet znakov: {CharacterCount}");
            Console.WriteLine($"Počet slov: {WordCount}");
            Console.WriteLine($"Počet medzier: {SpaceCount}");
        }
    }


// Main class of program
    class Program
    {
        static void Main(string[] args)
        {
            // Ask user for input text
            Console.WriteLine("Zadajte text:");
            string input = Console.ReadLine();

            // make object of Class
            TextAnalyzer analyzer = new TextAnalyzer(input);

            // Display Result
            analyzer.DisplayResults();
        }
    }
