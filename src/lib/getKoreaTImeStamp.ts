export function getKoreaTImeStamp(){
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
  
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes())
    );
  }
  