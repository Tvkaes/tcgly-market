import TCGdex from '@tcgdex/sdk'

const tcgdex = new TCGdex('en')
tcgdex.setCacheTTL(0)

export default tcgdex
