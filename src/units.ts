// 实现一个版本对比函数
export const versionCompare = (current:string, target:string) => {
    const currentArr = current.split('.');
    const targetArr = target.split('.');
    const len = Math.max(currentArr.length, targetArr.length);
    for (let i = 0; i < len; i++) {
      const curr = ~~currentArr[i];
      const targ = ~~targetArr[i];
      if (curr > targ) {
        return 1;
      } else if (curr < targ) {
        return -1;
      }
    }
    return 0;
  };
  