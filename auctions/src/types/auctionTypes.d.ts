type auction = {
    auctionId: number,
    title: string,
    endDate: string,
    categoryId: number;
    reserve: number,
    sellerId: number,
    sellerFirstName: string,
    sellerLastName: string,
    numBids: number,
    highestBid: number | null
    categoryName: string | null,
    description:string | null,
}

type category = {
    id: number,
    name: string
}

type bid = {
    bidderId: number,
    amount: number,
    firstName: string,
    lastName: string,
    timestamp: string,
}
