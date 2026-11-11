/**
 * Helper function to get personalized greeting based on user's name and time of day
 * @param name - The user's name
 * @returns Personalized greeting string or empty string if no name provided
 */
export function getPersonalizedGreeting(name: string | null | undefined) {
  if (!name) return "";
  
  const hour = new Date().getHours();
  let greeting = "";
  
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  
  return `${greeting}, ${name}`;
}