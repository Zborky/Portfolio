using System;

class Program
{
    static void Main()
    {
        int n = 10; // Count of numbers in the Fibonacci series to generate

        // Loop through the first 'n' numbers in the Fibonacci series
        for (int i = 0; i < n; i++)
        {
            Console.Write(Fibonacci(i) + " "); // Print each Fibonacci number followed by a space
        }
    }

    // Method to calculate the Fibonacci number at a given position 'num'
    static int Fibonacci(int num)
    {
        if (num <= 1) // Base case: Return the number itself if it's 0 or 1
            return num;

        int a = 0, b = 1, c = 0; // Initialize variables to store the last two Fibonacci numbers

        // Calculate Fibonacci number iteratively from 2 up to 'num'
        for (int i = 2; i <= num; i++)
        {
            c = a + b; // Current Fibonacci number is the sum of the previous two
            a = b;     // Update 'a' to the previous Fibonacci number
            b = c;     // Update 'b' to the current Fibonacci number
        }

        return c; // Return the Fibonacci number at position 'num'
    }
}