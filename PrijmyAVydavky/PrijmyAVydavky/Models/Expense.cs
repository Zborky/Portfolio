using SQLite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PrijmyAVydavky.Models
{
    public class Expense {
        [PrimaryKey,AutoIncrement]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public Decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }
}
