import { CurrencyGenerator } from "@/game/generators/CurrencyGenerator";

export const GoldCoin = (G) =>
    new CurrencyGenerator({
        name: "金币",
        sum: 100000n,
        G,
    });
