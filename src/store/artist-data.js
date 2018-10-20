const artists = [
  {
    artistCode: 'TKO',
    name: 'Takahiro Okawa',
    bio: 'He was born and raised in a Japanese seaside town. In teens PUNK · NEWWAVE sounded, fashion was inspired. He entered Tokyo as a department of photography at Nihon University College of Art and moved to Tokyo.',
    strapline: 'He was born and raised in a Japanese seaside town. In teens PUNK · NEWWAVE sounded, fashion was inspired.',
    twitter: '@oi_to_up',
    img: '/static/artists/Takahiro-Okawa@x2.png',
    live: true,
    ethAddress: '0x81918C90424235902b0330E4870d2267544421b0'
  },
  {
    artistCode: 'CNJ',
    name: 'CoinJournal',
    twitter: '@CoinJournal',
    bio: 'CoinJournal is a Manchester-based Bitcoin and cryptocurrency news site. The artwork submitted has been produced as a collaboration with several different designers, incorporating the style of 1930s cartoons and celebrating the disruptive nature of cryptocurrencies.',
    strapline: 'CoinJournal is a Manchester based artist who collaborates with several different designers, incorporating the style of 1930s cartoons',
    img: '/static/artists/coinjournal_x2.png',
    live: true,
    ethAddress: '0x7EdAbC5d4a3E1870b157caB79fAF5731389b07cF'
  },
  {
    artistCode: 'HKT',
    name: 'Hackatao',
    bio: 'Hackatao merges the cultured quotations from the past to bold and ultra-contemporary forms, standing out as an innovative exponent of the current artistic scenario. The artistic diptych Hackatao is formed by Sergio Scalet  and Nadia Squarci. “A dense visual texture that immediately catches the aesthetic sensibility of the beholder and expresses two complementary components of this successful artistic alliance.” Julie Kogler',
    strapline: 'Hackatao merges the cultured quotations from the past to bold and ultra-contemporary forms.',
    img: '/static/artists/Hackatao_Profile@x2.png',
    live: true,
    twitter: '@Hackatao',
    ethAddress: '0x21316E6A4F0Af45E5F1503984E83B10C53b177D8'
  },
  {
    artistCode: 'OBX',
    name: 'Obxium',
    bio: 'Coexisting and evolving with the algorithms while fighting for the user with digital art centered around cryptography and cryptocurrencies',
    strapline: 'Coexisting and evolving with the algorithms while fighting for the user with digital art centered around cryptography and cryptocurrencies',
    img: '/static/artists/Obxium_profile@x2.png',
    live: true,
    twitter: '@obxium',
    ethAddress: '0xf65DB13b5ee031CB0ebBa525eF21aa6C586681b3'
  },
  {
    artistCode: 'STR',
    name: 'Stan Ragets',
    bio: 'Stan Ragets has a background in computer programming and seeks to blend the technical and artistic sides of fractals together.',
    strapline: 'Stan Ragets has a background in computer programming and seeks to blend the technical and artistic sides of fractals together.',
    img: '/static/artists/StanR_Profile@x2.png',
    live: true,
    ethAddress: '0x96DEAD6149f580884410c873F6dA8d3DDE16F13C'
  },
  {
    artistCode: 'FKA',
    name: 'Franky Aguilar',
    bio: 'California native, studied web design and interactive media at The Art Institute of CA-San Francisco 2010.',
    strapline: 'California native, studied web design and interactive media at The Art Institute of CA-San Francisco 2010.',
    img: '/static/artists/Frank_G_Profile@x2.png',
    live: true,
    ethAddress: '0x2Eb9b439Ffb7dC587198e1534e465a6242192b24'
  },
  {
    artistCode: 'MNO',
    name: 'Manoloide',
    bio: 'Creative coder and generative designer.',
    strapline: 'Creative coder and generative designer.',
    img: '/static/artists/Manoloide_Profile@x2.png',
    live: true,
    twitter: '@manoloidee',
    ethAddress: '0x6fb7f9d87d2742baba47f61207d57ac3c0443482'
  },
  {
    artistCode: 'AKP',
    name: 'Aktiv Protesk',
    bio: 'Independent digital artists',
    strapline: 'Independent digital artists',
    img: '/static/artists/AktivProtesk_@x2.png',
    live: true,
    ethAddress: [
      '0xa2cD656f8461d2C186D69fFB8A4a5c10EFF0914d', // new - Note: the new address must always be at index zero
      '0x7DEc37c03ea5ca2C47ad2509BE6abAf8C63CDB39' // old
    ]
  },
  {
    artistCode: 'LHD',
    name: 'Lee Holland',
    bio: 'Hi, I’m Lee Holland, a multi-disciplined designer and illustrator based in Sheffield, United Kingdom. ',
    strapline: 'Hi, I’m Lee Holland, a multi-disciplined designer and illustrator based in Sheffield, United Kingdom.',
    img: '/static/artists/LeeHolland_Profile@x2.png',
    live: true,
    twitter: '@LeeDRHolland',
    ethAddress: '0xf397B52432fE7149Ce74849B15223f4502cdB1d3'
  },

  {
    artistCode: 'STJ',
    name: 'Stina Jones',
    bio: 'I’m a freelance Illustrator & Graphic Designer based in Manchester, with 15 years industry experience ',
    strapline: 'I’m a freelance Illustrator & Graphic Designer based in Manchester, with 15 years industry experience ',
    img: '/static/artists/StinaJones1_Profile@x2.png',
    live: true,
    twitter: '@stina_jones',
    ethAddress: '0x92baffdd6cfb11a4e57a58ffec4833b4d1abd25d'
  },
  {
    artistCode: 'BJD',
    name: 'Barrie J Davis',
    twitter: '@barriejdavies',
    strapline: 'Hello, I\'m Barrie J Davies and I\'m an artist. My artwork is a fun colourful psychedelic and humourous approach to expose the human condition.',
    bio: 'Hello, I\'m Barrie J Davies and I\'m an artist (born 1977) I\'m a British artist from Milford Haven, Pembrokeshire, Wales.',
    img: '/static/artists/BarrieD_@x2.png'
  },
  {
    artistCode: 'JOC',
    name: 'James O\'Connell',
    twitter: '@Jamesp0p',
    strapline: 'James O\'Connell is a Manchester based creative and illustrator. Simplicity is the key to his work allowing the expression of the idea to reign supreme.',
    bio: 'James O\'Connell is a Manchester based creative who has a passion for mixing colour and lines.',
    img: '/static/artists/JamesOc_@x2.png',
    live: true
  },
  {
    artistCode: 'PDA',
    name: 'Peter Davis',
    twitter: '@peterdavis_art',
    strapline: 'I am a Prize-winning professional portrait painter and member of MAFA. My aim, as a social realist painter, is to capture the spirit of the age and create contemporary portraiture.',
    bio: 'I am a prize-winning professional portrait painter and elected member of the Manchester Academy of Fine Arts (MAFA).',
    img: '/static/artists/PeterD_@x2.png',
    live: true
  },
  {
    artistCode: 'STA',
    name: 'Sam Taylor',
    twitter: '@SptSam',
    strapline: 'Sam Taylor is an independent graphic designer and illustrator known for his bold, unbridled and explosive artworks. Outrageous colour schemes and intricate line-work.',
    bio: 'Sam Taylor is known for his bold, unbridled and explosive artworks.',
    img: '/static/artists/SamT_@x2.png'
  },
  {
    artistCode: 'LHK',
    name: 'Laura Hawkins (aka Paper Hawk)',
    twitter: '@paper_hawk',
    bio: 'Laura Hawkins is a designer and illustrator based in Manchester. Her illustration alias ‘Paper Hawk’ was born of her desire to create illustrations full of character, charm and life - that weren\'t \'perfect\', but who\'s imperfections were what made them interesting.Working in graphic design since graduating from Falmouth College of Arts back in 2005 Laura had been increasingly drawn to illustration. After a recent move from London to Manchester, she began experimenting with using paper as the \'paint\', and discovered a passion she never knew existed.Her aim with Paper Hawk is to make engaging, interesting and unique illustrations that bring a brief to life. Using papers salvaged from magazines, newspapers, recycling bins, empty paper packaging, and donations from friends and colleagues her work aims to giving new life to something that would otherwise be discarded. She also creates some of the papers herself by painting with watercolours or inks and then tearing these up too.',
    strapline: 'Laura Hawkins is a Illustrator & paper collage artist inspired by nature.',
    img: '/static/artists/LauraH_@x2.png',
    live: true
  },
  {
    artistCode: 'JBO',
    name: 'Jane Bowyer',
    twitter: '@bowyerjane',
    strapline: 'Jane Bowyer is an independent graphic designer and illustrator based in Manchester.',
    bio: 'Jane Bowyer is an independent graphic designer and illustrator based in Manchester.',
    img: '/static/artists/JaneB_@x2.png'
  },
  {
    artistCode: 'CHE',
    name: 'Chris English',
    twitter: '@afullenglish',
    bio: '',
    img: '/static/artists/ChrisE_@x2.png'
  },
  {
    artistCode: 'KOR',
    name: 'Katie O\'Rourke',
    twitter: '@katieor_design',
    bio: 'Katie is a graphic designer, illustrator and artist currently based in Manchester. Her love for travel influences her work, often exploring places she has visited through both hand drawn and digital media. She’s interested in the dichotomy between these two approaches and the different sense of connection to place that comes through in each.',
    strapline: 'Katie is a graphic designer, illustrator and artist currently based in Manchester.',
    img: '/static/artists/KatieORouke_@x2.png',
    live: true
  },
  {
    artistCode: 'DVA',
    name: 'David Arnott',
    twitter: '@DavidPArnott7',
    bio: 'David Arnott is a Mosaic Artist based in Salford Manchester. He take popular and cultural icons and creates an image from hand cut pieces of ceramic tile',
    strapline: 'David Arnott is a Mosaic Artist based in Salford Manchester. He take popular and cultural icon',
    img: '/static/artists/david-arnott_x2.png'
  },
  {
    artistCode: '89A',
    name: '89—A',
    twitter: '@Mathew_Lucas',
    bio: 'Mathew is a multidisciplinary designer, one third of Studio Treble and behind the looping gif animations of 89A. Starting his career in games after studying graphic design, a diverse output is something he’s always strived for. From animation & illustration to branding & digital work.With 89A Mathew was originally looking to learn animation and 3D software, this quickly went from a side project to part of his daily routine. Working originally with the restrictive gif format, the constraints made a great playground for exploration and experimentation. Now he’s looking take what he has learnt with 89A and work on a more interactive experiences.',
    strapline: 'Mathew is a multidisciplinary designer, one third of Studio Treble and behind the looping gif animations of 89A.',
    img: '/static/artists/89AProfile@x2.png',
    live: true
  },
  {
    artistCode: 'PSP',
    name: 'Paris Psalter',
    bio: 'Will Halcomb is a digital designer and artist from Birmingham, Alabama. A recent graduate of the University of Mississippi with a degree in Graphic Design (BFA), he now lives in NYC.',
    strapline: 'Will Halcomb is a digital designer and artist from Birmingham, Alabama.',
    img: '/static/artists/ParisPSalter_Profile@x2.png',
    live: true,
    ethAddress: '0x8d01Bdf55Fa7f1CCfef7b670a11B8c14faf827Bf'
  },
  {
    artistCode: 'MKL',
    name: 'Mike Lewis',
    bio: 'Mike Lewis, (aka The Mighty Lark) began painting, drawing and illustrating professionally in the summer of 2003.',
    strapline: 'Mike Lewis, (aka The Mighty Lark,) began painting, drawing and illustrating professionally in the summer of 2003.',
    img: '/static/artists/MikeLewis_Profile@x2.png',
    live: true,
    twitter: '@Mighty_Lark'
  },
  {
    artistCode: 'TSM',
    name: 'Tony Smith',
    bio: 'Independent digital artist',
    strapline: 'Independent digital artist',
    img: '/static/artists/TonyS_Profile@x2.png',
    live: true
  },
  {
    artistCode: 'HSM',
    name: 'Hamish Muir',
    twitter: '@CoinJournal',
    bio: 'Hamish Muir was co-founder of the London-based graphic design studio 8vo (1985–2001), and co-editor of Octavo, International Journal of Typography (1986–92). Since 2001, he has held a fractional position as Senior Lecturer on the BA (Hons) Graphic and Media Design programme at the London College of Communication.',
    strapline: 'Hamish London-based graphic designer and Senior Lecturer on the BA (Hons) Graphic and Media Design programme at the London College of Communication.',
    img: '/static/artists/HamishMuirProfile@x2.png'
  },
  {
    artistCode: 'SCH',
    name: 'Stanley Chow',
    twitter: '@stan_chow',
    bio: 'Mancunian illustrator... I illustrate the faces of the New Yorker and sometimes other people',
    strapline: 'Mancunian illustrator... I illustrate the faces of the New Yorker and sometimes other people',
    img: '/static/artists/StanleyChowProfile@x2.png'
  },
  {
    artistCode: 'MRL',
    name: 'Muirmcneil',
    img: '/static/artists/MuirMcProfile@x2.png'
  },
  {
    artistCode: 'BYE',
    name: 'Bryan Edmondson',
    img: '/static/artists/BrynEdProfile@x2.png'
  },
  {
    artistCode: 'LAM',
    name: 'laurence-amelie',
    img: '/static/artists/LAProfile@x2.png'
  },
  {
    artistCode: 'LOS',
    name: 'L O S E V A',
    bio: 'L O S E V A is an independent visual artist focused on the exploration of the interactions of colors and forms, their tensions and specific language.',
    strapline: 'L O S E V A is an independent visual artist focused on the exploration of the interactions of colors and forms, their tensions and specific language.',
    img: '/static/artists/Alina_LProfilePic@x2_preview.png',
    live: true,
    ethAddress: '0x27b09d167d8ED88563d81ed766cBd280c8B434c5'
  },
  {
    artistCode: 'LEV',
    name: 'Lev Polyakov',
    bio: 'Creating Creations.',
    strapline: 'Creating Creations.',
    img: '/static/artists/LevP@x2.png',
    live: true,
    twitter: '@LevPo',
    ethAddress: '0x39c040b50A13894e19DFbb0aF47ac9bade9926Da'
  },
  {
    artistCode: 'MLO',
    name: 'Martin Lukas Ostachowski',
    bio: 'Geometric abstraction artist Martin Lukas Ostachowski is based in Sherbrooke, QC, Canada. His geometric abstraction paintings combine traditional with modern arts and crafts processes such as weaving, hand-cutting and laser-cutting. He prefers paper over canvas as it allows him to manipulate the medium. Fascinated by the socio-economic potential of blockchain technology, Martin explores the subject through geometric minimalism. His hand-drawn digital studies interpret the concept of blockchain architecture in preparation for his larger works on paper.',
    strapline: 'Geometric abstraction artist Martin Lukas Ostachowski is based in Sherbrooke, QC, Canada.',
    img: '/static/artists/MartinOk@x2.png',
    live: true,
    twitter: '@ArtByMLO',
    ethAddress: '0xe0F228070D8F7b5C25E9375Fa70FA418f8dfEDf8'
  },
  {
    artistCode: 'DWW',
    name: 'Drawingly Willingly',
    bio: 'Crypto artist at times... Unicorn lover, always.',
    strapline: 'Crypto artist at times... Unicorn lover, always.',
    img: '/static/artists/Drawingly_Profile@x2.jpg',
    live: true,
    twitter: '@DrawinglyW',
    ethAddress: '0x6c0ba5e435276621aa7a4a5de3c4e56a4092d782'
  },
  {
    artistCode: 'HEX',
    name: 'HEX0x6C',
    bio: 'HEX0x6C in my artistic nickname. It is the hexadecimal code for 108, which is the number of grains of the mala, which is a strand of grains that many Buddhists use when reciting mantras. In summary, HEX0x6C digests my dual nature: rational and spiritual.',
    strapline: 'HEX0x6C in my artistic nickname. It is the hexadecimal code for 108.',
    img: '/static/artists/HEX0x6C_Profile@x2.png',
    live: true,
    ethAddress: [
      '0xf8b32D30aC6Ab3030595432533D7836FD76B078d', // new
      '0x6F7fC56461F1Be9d430037f714AF67E641e5f6cF', // old
    ]
  },
  {
    artistCode: 'OTK',
    name: 'Oficinas TK',
    bio: 'Porto based visual artist with a strong focus on geometry and hermetics. Trough historical photographic processes, traditional engraving techniques, digital media, sound experiments and micro-publishing, OTK is a constant process of meditation on the representations of reality.',
    strapline: 'Porto based visual artist with a strong focus on geometry and hermetics.',
    img: '/static/artists/OTK_Profile@x2.png',
    live: true,
    ethAddress: '0xa4aD045d62a493f0ED883b413866448AfB13087C'
  },
  {
    artistCode: 'OXB',
    name: '0xBull',
    bio: 'In my younger years I learned to respect nature at the boyscouts. When growing older I got fascinated by computers and their possibilities. In the recent years my interests in (macro)photography and art grew. Combining these characteristics I make my art on the go.',
    strapline: 'In my younger years I learned to respect nature at the boyscouts.',
    img: '/static/artists/0xBull_Profile@x2.png',
    live: true,
    twitter: '@0xbull',
    ethAddress: '0xceF2bf4aD6D84Aa37Fcc4Cab6530028EB31c8e69'
  },
  {
    artistCode: 'JGP',
    name: 'JYGRAPHICDESIGN',
    bio: 'Designer, Illustrator and hopeful animator - When I\'m not designing i\'ll be in the outdoors or eating... sometimes both',
    strapline: 'Designer, Illustrator and hopeful animator',
    img: '/static/artists/Jordan-yates_Profile@x2.png',
    live: true,
    twitter: '@jygraphicdesign',
    ethAddress: '0x7EC1b3d17EC7Ff05B4dA25a0bE8636d5E5C3D7cD'
  },
  {
    artistCode: 'FAB',
    name: 'Fabiano',
    bio: 'Half industrial designer half artist, I like use different media. Pop art, colors and minimalism are the guides of my work.',
    strapline: 'Half industrial designer half artist, I like use different media. Pop art, colors and minimalism are the guides of my work.',
    img: '/static/artists/Fabiano_Profile@x2.png',
    live: true,
    twitter: '@fabianospeziari',
    website: 'http://www.fabianospeziari.com',
    ethAddress: '0x36BD6221c2016371C3aF00071726578b91AcB007'
  },
  {
    artistCode: 'SHC',
    name: 'Shortcut',
    bio: 'I am an artist, crypto-blogger and former TV editor.',
    strapline: 'I am an artist, crypto-blogger and former TV editor.',
    img: '/static/artists/ShortCut_Profile@x2.png',
    live: true,
    twitter: '@unityofmulti',
    website: 'https://steemit.com/@shortcut/',
    ethAddress: '0xe13d4abee4b304b67c52a56871141cad1b833aa7'
  },
  {
    artistCode: 'MCU',
    name: 'Mattia Cuttini',
    bio: 'Since 1979 I observe the world with curiosity. I studied electronics and worked in the sector for 10 years. I reinvented myself as designer. Musician since forever, I explored the visual and performance arts and I\'ve realized that my research is a matter of layers and overlapping interventions.',
    strapline: 'Since 1979 I observe the world with curiosity.',
    img: '/static/artists/mattiac_Profile@x2.png',
    live: true,
    twitter: '@mattiac',
    website: 'http://www.mattiac.it',
    ethAddress: [
      '0x576a655161b5502dcf40602be1f3519a89b71658', // new
      '0xa2806aD7af94bb0645e493a8dE9CFF583c462717' // old
    ]
  },
  {
    artistCode: 'POM',
    name: 'Philotimos',
    bio: 'Philotimos (philótimos) is a new fractal art creator influenced by technology, history, mythology, science and nature. His creations depict individual themes and concepts, eliciting imaginative responses, while conveying a sense of beauty and elegance to the beholder.',
    strapline: 'Philotimos (philótimos) is a new fractal art creator influenced by technology, history, mythology, science and nature.',
    img: '/static/artists/phil_Profile@x2.png',
    live: true,
    twitter: '@philotimosart',
    website: 'https://www.instagram.com/philotimosart/',
    ethAddress: '0x9Dfe031Be5EE3363D73183D34B1D3F9f6515c952'
  },
  {
    artistCode: 'MAC',
    name: 'Maarten Corpel',
    bio: 'Digital designer of things',
    strapline: 'Digital designer of things',
    img: '/static/artists/Maarten_AProfile@x2.png',
    live: true,
    twitter: '@maartencorpel',
    website: 'https://maartencorpel.com',
    ethAddress: '0xE9c57276EF46324d8144b3E759Ab0AC59F75513F'
  },
  {
    artistCode: 'KJG',
    name: 'Kjetil Golid',
    bio: 'Making generative graphics',
    strapline: 'Making generative graphics',
    img: '/static/artists/Kjetil_GProfile@x2.png',
    live: true,
    twitter: '@kGolid',
    website: 'https://generated.space/',
    ethAddress: '0x08f950816358F4306B70fB319E4F35c592d1B8a8'
  },
  {
    artistCode: 'RAD',
    name: 'Rare Designer',
    bio: 'Hello pepe community active. I am Pepe Designer, creator of rare pepes innovators, also illustrator and lover of crypto coins. Passionate about the MEME economy',
    strapline: 'I am Pepe Designer, creator of rare pepes innovators.',
    img: '/static/artists/Rare_D.png',
    live: true,
    twitter: '@Pepe_Designer',
    website: 'https://digirare.com/artists/rare-designer',
    ethAddress: '0x43a7634eb14c12b59be599487c1d7898a3d864c1'
  },
  {
    artistCode: 'MXO',
    name: 'Max Osiris',
    bio: 'Max Osiris is a transdimensional artist, combining and remixing disparate visual styles to create new categories as well as individual pieces. Combining AI and neural network art such as GANism with traditional methods of acrylics or the patterning of indigenous tribal art, Max creates unique remixes of visual flavors to create blockchain-based art that pays homage to DMT inspired imagery and historical masters',
    strapline: 'Max Osiris is a transdimensional artist, combining and remixing disparate visual styles to create new categories as well as individual pieces.',
    img: '/static/artists/Max_OProfile@x2.png',
    live: true,
    twitter: '@artofosiris',
    website: 'https://maxosiris.com/',
    ethAddress: '0x0b715ca8dc39e7f8a480d28d9822ae02f0a57008'
  },
  {
    artistCode: 'AZB',
    name: 'Azbeen',
    bio: 'Azbeen aka Aris Falegos is an artist who has a passion for creating images that tell stories and appeal to both children and the young at heart',
    strapline: 'Azbeen aka Aris Falegos is an artist who has a passion for creating images that tell stories and appeal to both children and the young at heart',
    twitter: '@azbeen',
    img: '/static/artists/azbeen_Profile@x2.png',
    website: 'www.azbeen.gr',
    ethAddress: '0x38cca9a8848D538FB29Bf55f664f948E24228bAa',
    live: true,
  },
  {
    artistCode: 'ALR',
    name: 'Angel L. Rodriguez',
    bio: 'I find bliss in capturing light and fleeting moments',
    strapline: 'I find bliss in capturing light and fleeting moments',
    twitter: '@alr020',
    img: '/static/artists/Angel-LProfile@x2.png',
    ethAddress: '0xedB3DefCD7f2B17aBd937C966a4067fe832Ea0C2',
    live: true,
  },
  {
    artistCode: 'DVT',
    name: 'Divo_Tvurce',
    bio: 'Contemporary artist Petr Němec',
    strapline: 'Contemporary artist Petr Němec',
    twitter: '@divo_tvurce',
    img: '/static/artists/divo_tvurce_Profile@x2.png',
    ethAddress: '0xdFa4feED08974A587139aF3e52826f41B6a82A8C',
    live: true,
  },
  {
    artistCode: 'DVT',
    name: 'XCOPY',
    bio: 'London based artist XCOPY explores death, dystopia and apathy through distorted visual loops. Warning: flashing imagery',
    strapline: 'London based artist XCOPY explores death, dystopia and apathy through distorted visual loops. Warning: flashing imagery',
    twitter: '@XCOPYART',
    website: 'https://xcopyart.com',
    img: '/static/artists/XCOPY_Profile@x2.png',
    ethAddress: '0x3768225622d53FfCc1E00eaC53a2A870ECd825C8',
    live: true,
  }
];

module.exports = artists;
