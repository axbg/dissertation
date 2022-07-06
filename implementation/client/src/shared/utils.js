export const splitChunk = (position, chunk) => {
    if(chunk.length <= position) {
        console.log("The chunk should be bigger than the position to split by");
    } else {
        const chunk1Size = position;
        const chunk1 = new Uint8Array(chunk1Size);
    
        const chunk2Size = chunk.length - position;
        const chunk2 = new Uint8Array(chunk2Size);

        for(let i = 0; i < position; i++) {
            chunk1[i] = chunk[i];
        }
    
        for(let i = 0, j = position; j < chunk.length; i++, j++) {
            chunk2[i] = chunk[i];
        }

        return [chunk1, chunk2];
    }
}

export const hardCopyArray = (src) => {
    let dst = new Uint8Array(src.length);

    for(let i = 0; i < src.length; i++) {
        dst[i] = src[i];
    }

    return dst;
}