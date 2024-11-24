export const JSON_with_bigInt = (data) => {
    return JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
};


export const createProbabilityFunction = ({
                                              probability: {
                                                  default: defaultProbability, max: maxProbability, min: minProbability
                                              },
                                              reference: {
                                                  default: defaultReference, max: maxReference, min: minReference
                                              },
                                          }) => {
    // 计算斜率和截距
    const slope = (maxProbability - minProbability) / (maxReference - minReference);
    const intercept = defaultProbability - slope * defaultReference;

    return (value) => {
        if (value <= minReference) {
            return minProbability;
        } else if (value >= maxReference) {
            return maxProbability;
        } else {
            // 线性插值
            return slope * value + intercept;
        }
    }
}


export const CheckActiveEffect = function (effectName) {
    return function (target, name, descriptor) {
        console.log('this', this)
        console.log(target, name, descriptor)
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            console.log(`Calling "${name}" with`, arguments);
            return originalMethod.apply(this, arguments);
        };
        return descriptor;
    }
}

/**
 * 生成大数
 * @param n 第一位数
 * @param z 后面跟 z 个 0
 */
export const createBigInt = ([n, z]) => {
    let number = `${n}`
    for (let i = 0; i < z; i++) {
        number += '0'
    }
    return BigInt(number)
}


export const spdSequenceGenerator = (initialValue) => {
    let sequence = [initialValue];
    return function (level) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(sequence[i - 2] * (1 - 0.01 * (i - 1)));
        }
        return sequence[level - 1];
    };
};

export const atkSequenceGenerator = (initialValue: bigint) => {
    let sequence = [initialValue]
    return function (level:number) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(
                ((sequence[i - 3] || initialValue)
                    +
                    sequence[i - 2]) / 2n
                +
                BigInt(Math.ceil(Number(initialValue) * (i / 27)))
            );
        }
        // 暂时抑制攻击增长
        // const ex = 1n + BigInt(Math.floor(level / 50));
        return sequence[level - 1]
    }
}


export const random = (min: number = 0, max: number = 1): bigint => {
    return BigInt(Math.ceil(Math.random() * (max - min) + min));
};

/**
 *
 * @param restrain
 * @param promote
 * @param min
 * @param max
 * @param norm
 * @returns
 */
export const randomWithAgl = (restrain: number, promote: number, min: number, max: number, norm: number): boolean => {
    const r = Math.random() * 100;
    const short = (promote - restrain) / 16;
    norm += short;
    norm = norm > max ? max : norm;
    norm = norm < min ? min : norm;
    return r < norm;
};


/**
 * 文字动画
 * canvasDom: HTMLCanvasElement
 */
export class TextAnimation {
    #canvas
    #ctx
    #fontSize = 16
    #fontFamily = 'Arial'
    #fillStyle = '#000000'

    #offCanvas
    #offCtx

    #animations = {}

    constructor(canvasDom: HTMLCanvasElement, options: {
        width: number,
        height: number,
    }) {
        this.#canvas = canvasDom
        this.#ctx = canvasDom.getContext('2d')
        canvasDom.width = options.width
        canvasDom.height = options.height

        this.#offCanvas = document.createElement('canvas')
        this.#offCtx = this.#offCanvas.getContext('2d')
        this.#offCanvas.width = options.width
        this.#offCanvas.height = options.height
        // this.initFont()
        this.animateText()
    }

    // initFont = () => {
    //     this.#ctx.font = `${this.#fontSize}px ${this.#fontFamily}`
    //     this.#ctx.fillStyle = `${this.#fillStyle}`
    //     this.#offCtx.font = `${this.#fontSize}px ${this.#fontFamily}`
    //     this.#offCtx.fillStyle = `${this.#fillStyle}`
    // }
    //
    // setText(options: {
    //     fontSize?: string,
    //     fontFamily?: string,
    //     fillStyle?: string
    // }) {
    //     options.fontSize && (this.#fontSize = options.fontSize)
    //     options.fontFamily && (this.#fontFamily = options.fontFamily)
    //     options.fillStyle && (this.#fillStyle = options.fillStyle)
    //     this.initFont()
    // }

    #duration = 1500
    #yOffset = 30
    drawFloatingText = (text: string, options: {
        x?: number, y?: number,
        color?: string, fontSize?: number, duration?: number
    } = {color: '#000000', fontSize: 16}) => {
        const startTime = performance.now();
        let x = options?.x, y = options?.y
        if (!x || !y) {
            x = this.#canvas.width * 1 / 6 + Math.random() * this.#canvas.width * 4 / 7
            y = this.#canvas.height * 1 / 4 + (Math.random() * this.#canvas.height * 2 / 3)
            // y = Math.random() * this.#canvas.height
        }

        // 将动画添加到数组
        this.#animations[`${options.color}-${options.fontSize}`] = this.#animations?.[`${options.color}-${options.fontSize}`] ?? []
        this.#animations[`${options.color}-${options.fontSize}`].push(
            {
                x,
                y,
                text,
                startTime,
                duration: options?.duration ?? this.#duration,
                color: options.color,
                fontSize: options.fontSize,
            }
        )
    }


    animateText = () => {
        // 在离屏画布上执行清除操作
        this.#offCtx.clearRect(0, 0, this.#offCanvas.width, this.#offCanvas.height);

        const currentTime = performance.now();

        Object.keys(this.#animations).forEach(key => {
            const items = this.#animations[key]
            const [color, fontSize] = key.split('-')
            this.#ctx.font = `${fontSize}px ${this.#fontFamily}`
            this.#ctx.fillStyle = `${color}`
            this.#offCtx.font = `${fontSize}px ${this.#fontFamily}`
            this.#offCtx.fillStyle = `${color}`
            items.forEach((anim, index) => {
                const elapsed = currentTime - anim.startTime;
                const progress = Math.min(elapsed / anim.duration, 1);

                const alpha = 1 - progress;
                const offsetY = -progress * this.#yOffset;

                // 绘制到离屏画布
                this.#offCtx.globalAlpha = alpha;
                this.#offCtx.fillText(anim.text, anim.x, anim.y + offsetY);
                this.#offCtx.globalAlpha = 1;

                if (progress >= 1) {
                    items.splice(index, 1); // 移除已完成的动画
                }
            });
        })

        // 将离屏画布内容绘制到主画布
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.drawImage(this.#offCanvas, 0, 0);

        requestAnimationFrame(this.animateText); // 持续调用以更新动画
    }

}