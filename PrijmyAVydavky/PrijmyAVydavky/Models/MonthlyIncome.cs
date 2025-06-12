using SQLite;

namespace PrijmyAVydavky.Models{

    public class MonthlyIncome {
        [PrimaryKey,AutoIncrement]
        public int Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Income { get; set; }
    
    
    }


}