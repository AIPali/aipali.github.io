// 重新生成的律藏 (Vinaya Piṭaka) 侧边栏数据 (独享视图优化版 + 补零修正)
export const sidebarVA =[
  { label: 'VA 律藏导读', link: '/vinaya/' },
  {
    label: '比丘分别 (Bhikkhuvibhaṅga)',
    collapsed: false, // 核心内容，默认展开
    items:[
      {
        label: 'BV 1 弃罪篇 (Pārājikakaṇḍa)',
        collapsed: false, // 最严重的四根本戒，条目少，默认展开
        items:[
          { label: 'BV 1.0 韦兰若品 (Verañjakaṇḍa)', link: '/vinaya/bv/kanda-01-parajika/bv-01-00-veranjaka/' },
          { label: 'BV 1.1 弃罪一：不净行 (Paṭhamapārājika)', link: '/vinaya/bv/kanda-01-parajika/bv-01-01-pathama/' },
          { label: 'BV 1.2 弃罪二：偷盗 (Dutiyapārājika)', link: '/vinaya/bv/kanda-01-parajika/bv-01-02-dutiya/' },
          { label: 'BV 1.3 弃罪三：杀人 (Tatiyapārājika)', link: '/vinaya/bv/kanda-01-parajika/bv-01-03-tatiya/' },
          { label: 'BV 1.4 弃罪四：妄称证得上人法 (Catutthapārājika)', link: '/vinaya/bv/kanda-01-parajika/bv-01-04-catuttha/' },
        ]
      },
      {
        label: 'BV 2 僧残篇 (Saṃghādisesakaṇḍa)',
        collapsed: true, // 条目较多(13项)，默认折叠
        items:[
          { label: 'BV 2.1 僧残一：故泄不净 (Sukkavissaṭṭhi)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-01-sukkavissatthi/' },
          { label: 'BV 2.2 僧残二：染心碰触 (Kāyasaṃsagga)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-02-kayasamsagga/' },
          { label: 'BV 2.3 僧残三：染心粗话 (Duṭṭhullavācā)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-03-dutthullavaca/' },
          { label: 'BV 2.4 僧残四：不净侍奉 (Attakāmapāricariya)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-04-attakamaparicariya/' },
          { label: 'BV 2.5 僧残五：作媒人 (Sañcaritta)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-05-sancaritta/' },
          { label: 'BV 2.6 僧残六：自造小屋 (Kuṭikāra)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-06-kutikara/' },
          { label: 'BV 2.7 僧残七：自造精舍 (Vihārakāra)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-07-viharakara/' },
          { label: 'BV 2.8 僧残八：恶意诽谤 (Duṭṭhadosa)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-08-dutthadosa/' },
          { label: 'BV 2.9 僧残九：借口诽谤 (Dutiyaduṭṭhadosa)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-09-dutiyadutthadosa/' },
          { label: 'BV 2.10 僧残十：分裂僧团 (Saṃghabheda)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-10-sanghabheda/' },
          { label: 'BV 2.11 僧残十一：同党破僧 (Bhedānuvattaka)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-11-bhedanuvattaka/' },
          { label: 'BV 2.12 僧残十二：难以劝谏 (Dubbaca)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-12-dubbaca/' },
          { label: 'BV 2.13 僧残十三：恶行污家 (Kuladūsaka)', link: '/vinaya/bv/kanda-02-sanghadisesa/bv-02-13-kuladusaka/' },
        ]
      },
      { label: 'BV 3 不定篇 (Aniyatakaṇḍa)', link: '/vinaya/bv/kanda-03-aniyata/' },
      {
        label: 'BV 4 舍堕篇 (Nissaggiyakaṇḍa)',
        collapsed: true,
        items:[
          { label: 'BV 4.1 迦絺那衣品 (Cīvaravagga)', link: '/vinaya/bv/kanda-04-nissaggiya/bv-04-01-civara/' },
          { label: 'BV 4.2 蚕丝品 (Kosiyavagga)', link: '/vinaya/bv/kanda-04-nissaggiya/bv-04-02-kosiya/' },
          { label: 'BV 4.3 蓄钵品 (Pattavagga)', link: '/vinaya/bv/kanda-04-nissaggiya/bv-04-03-patta/' },
        ]
      },
      {
        label: 'BV 5 单堕篇 (Pācittiyakaṇḍa)',
        collapsed: true,
        items:[
          { label: 'BV 5.1 妄语品 (Musāvādavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-01-musavada/' },
          { label: 'BV 5.2 植物品 (Bhūtagāmavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-02-bhutagama/' },
          { label: 'BV 5.3 教诫品 (Ovādavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-03-ovada/' },
          { label: 'BV 5.4 受食品 (Bhojanavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-04-bhojana/' },
          { label: 'BV 5.5 裸行品 (Acelakavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-05-acelaka/' },
          { label: 'BV 5.6 饮酒品 (Surāpānavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-06-surapana/' },
          { label: 'BV 5.7 水生物品 (Sappāṇakavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-07-sappanaka/' },
          { label: 'BV 5.8 如法品 (Sahadhammikavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-08-sahadhammika/' },
          { label: 'BV 5.9 宝物品 (Ratanavagga)', link: '/vinaya/bv/kanda-05-pacittiya/bv-05-09-ratana/' },
        ]
      },
      { label: 'BV 6 悔过篇 (Pāṭidesanīyakaṇḍa)', link: '/vinaya/bv/kanda-06-patidesaniya/' },
      { label: 'BV 7 众学篇 (Sekhiyakaṇḍa)', link: '/vinaya/bv/kanda-07-sekhiya/' },
      { label: 'BV 8 灭诤篇 (Adhikaraṇasamatha)', link: '/vinaya/bv/kanda-08-adhikaranasamatha/' },
    ]
  },
  {
    label: '比丘尼分别 (Bhikkhunivibhaṅga)',
    collapsed: true, // 次核心大类，默认折叠
    items:[
      { label: 'NV 1 弃罪篇 (Pārājikakaṇḍa)', link: '/vinaya/nv/kanda-01-parajika/' },
      { label: 'NV 2 僧残篇 (Saṅghādisesakaṇḍa)', link: '/vinaya/nv/kanda-02-sanghadisesa/' },
      { label: 'NV 3 舍堕篇 (Nissaggiyakaṇḍa)', link: '/vinaya/nv/kanda-03-nissaggiya/' },
      {
        label: 'NV 4 单堕篇 (Pācittiyakaṇḍa)',
        collapsed: true,
        items:[
          { label: 'NV 4.1 食蒜品 (Lasuṇavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-01-lasuna/' },
          { label: 'NV 4.2 暗夜品 (Andhakāravagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-02-andhakara/' },
          { label: 'NV 4.3 裸露品 (Naggavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-03-nagga/' },
          { label: 'NV 4.4 共卧品 (Tuvaṭṭavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-04-tuvatta/' },
          { label: 'NV 4.5 画室品 (Cittāgāravagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-05-cittagara/' },
          { label: 'NV 4.6 僧园品 (Ārāmavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-06-arama/' },
          { label: 'NV 4.7 孕妇品 (Gabbhinīvagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-07-gabbhini/' },
          { label: 'NV 4.8 童女品 (Kumāribhūtavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-08-kumaribhuta/' },
          { label: 'NV 4.9 伞履品 (Chattupāhanavagga)', link: '/vinaya/nv/kanda-04-pacittiya/nv-04-09-chattupahana/' },
        ]
      },
      { label: 'NV 5 悔过篇 (Pāṭidesanīyakaṇḍa)', link: '/vinaya/nv/kanda-05-patidesaniya/' },
      { label: 'NV 6 众学篇 (Sekhiyakaṇḍa)', link: '/vinaya/nv/kanda-06-sekhiya/' },
      { label: 'NV 7 灭诤篇 (Adhikaraṇasamathā)', link: '/vinaya/nv/kanda-07-adhikaranasamatha/' },
    ]
  },
  {
    label: '大品 (Mahāvaggapāḷi)',
    collapsed: true, // 篇目较多，非最高频，默认折叠
    items:[
      { label: 'MV 1 大篇 (Mahākhandhaka)', link: '/vinaya/mv/mv-01-mahakhandhaka/' },
      { label: 'MV 2 布萨篇 (Uposathakkhandhaka)', link: '/vinaya/mv/mv-02-uposatha/' },
      { label: 'MV 3 入雨安居篇 (Vassūpanāyikakkhandhaka)', link: '/vinaya/mv/mv-03-vassupanayika/' },
      { label: 'MV 4 自恣篇 (Pavāraṇākkhandhaka)', link: '/vinaya/mv/mv-04-pavarana/' },
      { label: 'MV 5 皮革篇 (Cammakkhandhaka)', link: '/vinaya/mv/mv-05-camma/' },
      { label: 'MV 6 药篇 (Bhesajjakkhandhaka)', link: '/vinaya/mv/mv-06-bhesajja/' },
      { label: 'MV 7 迦絺那衣篇 (Kathinakkhandhaka)', link: '/vinaya/mv/mv-07-kathina/' },
      { label: 'MV 8 衣篇 (Cīvarakkhandhaka)', link: '/vinaya/mv/mv-08-civara/' },
      { label: 'MV 9 瞻波篇 (Campeyyakkhandhaka)', link: '/vinaya/mv/mv-09-campeyya/' },
      { label: 'MV 10 拘睒弥篇 (Kosambakakkhandhaka)', link: '/vinaya/mv/mv-10-kosambaka/' },
    ]
  },
  {
    label: '小品 (Cūḷavaggapāḷi)',
    collapsed: true, // 篇目较多，非最高频，默认折叠
    items:[
      { label: 'CV 1 羯磨篇 (Kammakkhandhaka)', link: '/vinaya/cv/cv-01-kamma/' },
      { label: 'CV 2 别住篇 (Pārivāsikakkhandhaka)', link: '/vinaya/cv/cv-02-parivasika/' },
      { label: 'CV 3 集篇 (Samuccayakkhandhaka)', link: '/vinaya/cv/cv-03-samuccaya/' },
      { label: 'CV 4 灭诤篇 (Samathakkhandhaka)', link: '/vinaya/cv/cv-04-samatha/' },
      { label: 'CV 5 小事篇 (Khuddakavatthukkhandhaka)', link: '/vinaya/cv/cv-05-khuddakavatthu/' },
      { label: 'CV 6 卧坐具篇 (Senāsanakkhandhaka)', link: '/vinaya/cv/cv-06-senasana/' },
      { label: 'CV 7 破僧篇 (Saṅghabhedakakkhandhaka)', link: '/vinaya/cv/cv-07-sanghabheda/' },
      { label: 'CV 8 仪法篇 (Vattakkhandhaka)', link: '/vinaya/cv/cv-08-vatta/' },
      { label: 'CV 9 止诵戒篇 (Pātimokkhaṭṭhapanakkhandhaka)', link: '/vinaya/cv/cv-09-patimokkhatthapana/' },
      { label: 'CV 10 比丘尼篇 (Bhikkhunikkhandhaka)', link: '/vinaya/cv/cv-10-bhikkhuni/' },
      { label: 'CV 11 五百结集篇 (Pañcasatikakkhandhaka)', link: '/vinaya/cv/cv-11-pancasatika/' },
      { label: 'CV 12 七百结集篇 (Sattasatikakkhandhaka)', link: '/vinaya/cv/cv-12-sattasatika/' },
    ]
  },
  {
    label: '附随 (Parivārapāḷi)',
    collapsed: true, // 律藏附录，极长(21项)，强制默认折叠
    items:[
      { label: 'PV 1 比丘分别 (Bhikkhuvibhaṅga)', link: '/vinaya/pv/pv-01-bhikkhuvibhanga/' },
      { label: 'PV 2 比丘尼分别 (Bhikkhunivibhaṅga)', link: '/vinaya/pv/pv-02-bhikkhunivibhanga/' },
      { label: 'PV 3 等起顶摄颂 (Samuṭṭhānasīsasaṅkhepa)', link: '/vinaya/pv/pv-03-samutthanasisa/' },
      { label: 'PV 4 复习 (Antarapeyyāla)', link: '/vinaya/pv/pv-04-antarapeyyala/' },
      { label: 'PV 5 灭诤分别 (Samathabheda)', link: '/vinaya/pv/pv-05-samathabheda/' },
      { label: 'PV 6 问篇章 (Khandhakapucchāvāra)', link: '/vinaya/pv/pv-06-khandhakapuccha/' },
      { label: 'PV 7 增一法 (Ekuttarikanaya)', link: '/vinaya/pv/pv-07-ekuttarikanaya/' },
      { label: 'PV 8 布萨等问答 (Uposathādipucchāvissajjanā)', link: '/vinaya/pv/pv-08-uposathadipuccha/' },
      { label: 'PV 9 制戒义利论 (Atthavasapakaraṇa)', link: '/vinaya/pv/pv-09-atthavasa/' },
      { label: 'PV 10 偈集 (Gāthāsaṅgaṇika)', link: '/vinaya/pv/pv-10-gathasanganika/' },
      { label: 'PV 11 诤事分别 (Adhikaraṇabheda)', link: '/vinaya/pv/pv-11-adhikaranabheda/' },
      { label: 'PV 12 别偈集 (Aparagāthāsaṅgaṇika)', link: '/vinaya/pv/pv-12-aparagathasanganika/' },
      { label: 'PV 13 责问篇 (Codanākaṇḍa)', link: '/vinaya/pv/pv-13-codana/' },
      { label: 'PV 14 诤论小篇 (Cūḷasaṅgāma)', link: '/vinaya/pv/pv-14-culasangama/' },
      { label: 'PV 15 诤论大篇 (Mahāsaṅgāma)', link: '/vinaya/pv/pv-15-mahasangama/' },
      { label: 'PV 16 功德衣分别 (Kathinabheda)', link: '/vinaya/pv/pv-16-kathinabheda/' },
      { label: 'PV 17 优波离问五法 (Upālipañcaka)', link: '/vinaya/pv/pv-17-upalipancaka/' },
      { label: 'PV 18 罪之等起 (Atthāpattisamuṭṭhāna)', link: '/vinaya/pv/pv-18-atthapattisamutthana/' },
      { label: 'PV 19 第二偈集 (Dutiyagāthāsaṅgaṇika)', link: '/vinaya/pv/pv-19-dutiyagathasanganika/' },
      { label: 'PV 20 发汗偈 (Sedamocanagāthā)', link: '/vinaya/pv/pv-20-sedamocana/' },
      { label: 'PV 21 五品 (Pañcavagga)', link: '/vinaya/pv/pv-21-pancavagga/' },
    ]
  },
  {
    label: '波罗提木叉 (Dvemātikāpāḷi)',
    collapsed: false, // 极端高频诵读区域，仅两项，默认展开
    items:[
      { label: 'DV 1 比丘波罗提木叉 (Bhikkhupātimokkha)', link: '/vinaya/dv/dv-01-bhikkhupatimokkha/' },
      { label: 'DV 2 比丘尼波罗提木叉 (Bhikkhunīpātimokkha)', link: '/vinaya/dv/dv-02-bhikkhunipatimokkha/' },
    ]
  }
];