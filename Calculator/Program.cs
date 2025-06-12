using System;
using System.Reflection.Metadata;

public class Calculator
{
    // Attributes to store the two numbers
    private double num1;
    private double num2;

    // Constructor to initialize the calculator with two numbers
    public Calculator(double num1, double num2)
    {
        this.num1 = num1;
        this.num2 = num2;
    }

    // Method to add the two numbers
    public double Add()
    {
        return num1 + num2;
    }

    // Method to subtract the second number from the first
    public double Substract()
    {
        return num1 - num2;
    }

    // Method to multiply the two numbers
    public double Multiply()
    {
        return num1 * num2;
    }

    // Method to divide the first number by the second
    public double Divide()
    {
        if (num2 == 0)
        {
            // Throw exception if trying to divide by zero
            throw new DivideByZeroException("Cannot divide by zero");
        }
        return num1 / num2;
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to the object-oriented calculator!");

            // Loop until the user decides to exit
            while (true)
            {
                try
                {
                    // Display the menu of operations
                    Console.WriteLine("\nChoose an operation:");
                    Console.WriteLine("1: Addition (+)");
                    Console.WriteLine("2: Subtraction (-)");
                    Console.WriteLine("3: Multiplication (*)");
                    Console.WriteLine("4: Division (/)");
                    Console.WriteLine("5: Exit");

                    Console.Write("Your choice: ");
                    string choice = Console.ReadLine();

                    // Exit the loop if user chooses to exit
                    if (choice == "5")
                    {
                        Console.WriteLine("Exiting the calculator. Have a great day!");
                        break;
                    }

                    // Get the two numbers from the user
                    Console.Write("Enter the first number: ");
                    double number1 = Convert.ToDouble(Console.ReadLine());

                    Console.Write("Enter the second number: ");
                    double number2 = Convert.ToDouble(Console.ReadLine());

                    // Create a calculator object with the input numbers
                    Calculator calculator = new Calculator(number1, number2);

                    // Perform the selected operation
                    switch (choice)
                    {
                        case "1":
                            Console.WriteLine($"Result: {number1} + {number2} = {calculator.Add()}");
                            break;
                        case "2":
                            Console.WriteLine($"Result: {number1} - {number2} = {calculator.Substract()}");
                            break;
                        case "3":
                            Console.WriteLine($"Result: {number1} * {number2} = {calculator.Multiply()}");
                            break;
                        case "4":
                            try
                            {
                                // Handle division by zero exception
                                Console.WriteLine($"Result: {number1} / {number2} = {calculator.Divide()}");
                            }
                            catch (DivideByZeroException ex)
                            {
                                Console.WriteLine($"Error: {ex.Message}");
                            }
                            break;
                        default:
                            Console.WriteLine("Invalid choice. Please try again.");
                            break;
                    }
                }
                catch (FormatException)
                {
                    // Handle invalid input format exception
                    Console.WriteLine("Error: Input must be a number.");
                }
            }
        }
    }
}
