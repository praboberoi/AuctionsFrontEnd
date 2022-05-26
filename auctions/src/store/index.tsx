import create from 'zustand';

interface UserState {
    currentUser: user
    auctions: auction[]
    filteredAuctions:auction[]
    categories: category[]
    loggedOut: boolean

    setId: (givenId:number) => void
    setUser:(givenUser: user) => void;
    setAuthToken:(givenAuthToken: string) => void
    setAuctions:(givenAuctions: auction[]) => void
    setCategories:(givenCategories:category[]) => void
    setCategoryNames:() => void
    filterAuctions:(givenCategories: category[]) => void
    initialiseFilteredAuctions:(givenActions: auction[]) => void
    setLoggedOut:(isLoggedOut:boolean) => void
    removeAuction:(givenAuction:auction) => void

}

const getLocalStorageUser = (key: string): user => JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorageUser = (key:string, value:user) => window.localStorage.setItem(key, JSON.stringify(value));

const getLocalStorageAuctions = (key: string): Array<auction> => JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorageAuctions = (key:string, value:Array<auction>) => window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<UserState>((set) => ({
    currentUser: getLocalStorageUser('user') || {userId: -1, token: ""},
    auctions: [],
    categories: [],
    filteredAuctions: getLocalStorageAuctions('auctions') || [],
    loggedOut:true,

    setUser: (givenUser: user) => set(() => {
        setLocalStorageUser('user', givenUser)
        return {currentUser: givenUser}
    }),

    setId:(givenId:number) => set( (state) => {
        state.currentUser.userId = givenId
        setLocalStorageUser('user', state.currentUser)
        return {currentUser: state.currentUser}

    }),
    setAuthToken:(givenAuthToken:string) => set( (state) => {
        state.currentUser.token = givenAuthToken
        setLocalStorageUser('user', state.currentUser)
        return {currentUser: state.currentUser}
    }),

    setAuctions:(givenAuctions: auction[]) => set( () => {
        setLocalStorageAuctions('auctions', givenAuctions)
        return{auctions: givenAuctions}
    }),

    setCategories:(givenCategories:category[]) => set( () => {
        return{categories: givenCategories}
    }),

    setCategoryNames: () => set( (state) => {
        const currentAuctions = state.auctions
        const categories = state.categories
        for (let currAuc of currentAuctions) {
            for (let cat of categories) {
                if (currAuc.categoryId === cat.categoryId)
                    currAuc.categoryName = cat.name
            }
        }
        return {auctions: currentAuctions}
    }),

    filterAuctions:(givenCategories: category[]) => set((state) => {
        const auctionsToFilter = state.filteredAuctions
        const newAuctions = []
        for (let currAuc of auctionsToFilter) {
            for (let cat of givenCategories) {
                if (currAuc.categoryId === cat.categoryId)
                    newAuctions.push(currAuc)
            }
        }
        setLocalStorageAuctions('auctions', newAuctions)
        return {filteredAuctions: newAuctions}
    }),

    initialiseFilteredAuctions:(givenActions: auction[]) => set((state) => {
        setLocalStorageAuctions('auctions', givenActions)
        return{filteredAuctions: givenActions}
    }),

    setLoggedOut:(isLoggedOut:boolean) => set(() => {
       return{loggedOut:isLoggedOut}
    }),

    removeAuction: (givenAuction:auction) => set((state) => {
        const updatedAuctions = state.auctions.filter(a => a.auctionId !== givenAuction.auctionId)
        setLocalStorageAuctions('auctions', updatedAuctions)
        return{auctions:updatedAuctions}
    }),

}))




export const useUserStore = useStore;