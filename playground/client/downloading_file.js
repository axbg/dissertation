// const queueingStrategy = new ByteLengthQueuingStrategy({ highWaterMark: 1 });

const writableStream = new WritableStream({
    write(chunk) {
        return new Promise((resolve, reject) => {
            console.log("received chunk: ");
            console.log(chunk);
            resolve();
        });
    },
    close() {
        return new Promise((resolve, reject) => {
            console.log("closed");
            resolve();
        })
    },
    abort(err) {
        return new Promise((resolve, reject) => {
            console.log("aborted");
            console.log(err);
            resolve();
        })
    }
    // queueingStrategy
});


fetch("http://localhost:8080/api/download")
    .then(response => response.body)
    .then(readableStream => {
        readableStream.pipeTo(writableStream);
    });