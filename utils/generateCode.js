const generateCode = () => {
    const arr = ['a','b','c','d','e','1','2','3','4','5','6','7','8','9','0'];
    let str = "";
    for(let i = 0;i < 6;i++){
        let idx = Math.floor(Math.random() * (arr.length));
        str += (arr[idx]);
    }
    return str;
}

export default generateCode;