
  function randomChars() {
    let string = "";
    let choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

    for (let i = 0; i < 8; i++) {
      string += choices.charAt(Math.floor(Math.random() * choices.length));
    }
    return string;
}

const contentStream = new ReadableStream({
    start(controller) {
        setInterval(() => {
            controller.enqueue(randomChars());            
        }, 500)
    },
    cancel() {
        console.log("closed");
    }
});

fetch("http://localhost:8080/api/upload", {
  method: 'POST',
  body: contentStream
});