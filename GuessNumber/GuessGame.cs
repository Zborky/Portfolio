using System;

public class GuessNumber
{
    // Target number to guess
    private int targetNumber;
    // Counter for the number of attempts
    private int attepmts;

    // Constructor initializes the target number randomly between 1 and 100 and sets attempts to 0
    public GuessNumber()
    {
        Random random = new Random();
        targetNumber = random.Next(1, 100);
        attepmts = 0;
    }

    // Method to start the game
    public void Start()
    {
        Console.WriteLine("Welcome to the Guess Number Game!");
        Console.WriteLine("Guess the number between 1 and 100");
        Console.WriteLine("Try to guess the number ");

        int guess = 0;

        // Loop until the user guesses the correct number
        while (guess != targetNumber)
        {
            Console.WriteLine("Enter your guess: ");

            // Try to parse user input to an integer
            if (int.TryParse(Console.ReadLine(), out guess))
            {
                // Increase attempt count on valid guess
                attepmts++;
                // Check the guess and give feedback
                CheckGuess(guess);
            }
            else
            {
                // Inform the user if input is invalid
                Console.WriteLine("Please enter a valid number");
            }
            // This message is inside the loop, so it will show after each guess (consider moving it outside the loop if intended once)
            Console.WriteLine("Thanks for playing");
        }
    }

    // Method to check the user's guess against the target number
    private void CheckGuess(int guess)
    {
        if (guess < targetNumber)
        {
            Console.WriteLine("The number is greater than " + guess);
        }
        else if (guess > targetNumber)
        {
            Console.WriteLine("The number is less than " + guess);
        }
        else
        {
            // Congratulate the user when they guess correctly
            Console.WriteLine("Congratulations! You have guessed the number in " + attepmts + " attempts");
        }
    }
}
