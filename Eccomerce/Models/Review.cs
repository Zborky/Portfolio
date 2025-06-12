

namespace EshopCrud.Models{
    public class Review{
        public int Id {get; set;}
        public string? Name {get; set;} = string.Empty;
        public string? Email{get; set;} = string.Empty;
        public string? Product{get;set;} = string.Empty;

        public string? Text{get;set;} = string.Empty;
        public int Rating{get;set;}
        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }

}