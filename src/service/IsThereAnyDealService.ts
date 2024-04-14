import { ServerAPI, ServerResponse } from "decky-frontend-lib";

export interface Deal {
    shop: {
        id: number;
        name: string;
    };
    price: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    regular: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    cut: number;
    voucher: null | string;
    storeLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    historyLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    flag: string;
    drm: {
        id: number;
        name: string;
    }[];
    platforms: {
        id: number;
        name: string;
    }[];
    timestamp: string;
    expiry: string | null;
    url: string;
}

interface DealResponse {
    id: string;
    deals: Deal[];
}

interface Game {
    id: string;
    slug: string;
    title: string;
    type: null;
    mature: boolean;
}

interface GameResponse {
    found: boolean;
    game: Game;
}

interface ServerResponseResult {
    body: string
}



export let isThereAnyDealService: IsThereAnyDealService

export class IsThereAnyDealService {
  private readonly serverAPI: ServerAPI;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI) {
    isThereAnyDealService = new IsThereAnyDealService(serverAPI);
  }

  getBestDealForSteamAppId = async (appId: string) => {
    const API_KEY = "dcf54ab1effbba9f92c85eef25b4dd5e0610d65a"

    // Get the isThereAnyDeal gameID from a steam appId
    const serverResponseGameId: ServerResponse<ServerResponseResult> =
                    await this.serverAPI.fetchNoCors<ServerResponseResult>(
                        `https://api.isthereanydeal.com/games/lookup/v1?key=${API_KEY}&appid=${appId}`,
                        {
                            method: 'GET',
                        }
                    );
    
    
    if(!serverResponseGameId.success) return "No deals found"
    const gameResponse: GameResponse = JSON.parse(serverResponseGameId.result.body) 
    const isThereAnyDealGameId = gameResponse.game.id
    
    // Use the new gameId to fetch the best deal for it

    const serverResponseDeals: ServerResponse<ServerResponseResult> = 
        await this.serverAPI.fetchNoCors<ServerResponseResult>(
        `https://api.isthereanydeal.com/games/prices/v2?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //@ts-ignore
            json: [isThereAnyDealGameId],
        }
    );
    

    if(!serverResponseDeals.success) return "No deals found"
    const dealResponse: DealResponse[] = JSON.parse(serverResponseDeals.result.body)
    if(dealResponse.length <= 0  || dealResponse[0].deals.length <= 0 ) return "No deals found"
    
    // Initialize variables to track the lowest price deal
    let lowestPrice = Infinity;
    let lowestPriceDeal = null;

    // Iterate over all deals to find the one with the lowest price
    for (const deal of dealResponse[0].deals) {
        if (deal.price.amount < lowestPrice) {
            lowestPrice = deal.price.amount;
            lowestPriceDeal = deal;
        }
    }

    // Check if a deal with the lowest price was found
    if (!lowestPriceDeal) return "No deals found";

    // Extract information from the lowest price deal
    const price = lowestPriceDeal.price;
    const store = lowestPriceDeal.shop.name;

    // Return the result
    return `Lowest price on ${store}: ${price.currency} ${price.amount}`;
  }


}

