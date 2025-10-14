import useGameStore from "../../store/gameStore.js";

const LoreScreen = () => {
  const handleChoice = useGameStore((state) => state.handleChoice);

  return (
    <div className="relative min-h-screen w-full">
      {/* Image de fond fixe qui couvre tout l'écran */}
      <div
        className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/assets/img/fond lore.png)",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center center"
        }}></div>

      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40"></div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 p-6">
        {/* En-tête */}
        <header className="text-center border-b-2 border-green-500/30 pb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Le Cycle de Prométhée
          </h2>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Confidentiel - Accès Opérateur Uniquement
          </p>
        </header>

        <article className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {/* Section 1: Le contexte technologique */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Le contexte technologique :
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Le XXIIe siècle a inauguré l'ère de la Neuro-Technologie. La
                percée fut la création du Neuro-Cortique <em>Syncron</em>, un
                implant neurologique permettant la connexion directe de l'esprit
                au réseau mondial. Cette technologie promettait le partage
                instantané du savoir humain. Cependant, le <em>Syncron</em>{" "}
                devint rapidement un outil de division :
                <ul className="mt-3 space-y-2">
                  <li className="text-gray-300">
                    • Chez la Fédération Eurasiatique Unifiée (FEU) : Le savoir
                    est filtré. Le réseau est centralisé et hermétique, le
                    rendant fiable pour les données scientifiques pures, mais
                    purgé de toute information allant à l'encontre de la
                    propagande et du dogme nationaliste.
                  </li>
                  <li className="text-gray-300">
                    • Chez la Confédération des États Libres (CEL) : Le savoir
                    est pollué. Le réseau est ouvert, mais saturé de publicités
                    intrusives, de théories d'experts auto-proclamés et de
                    désinformation, le rendant opaque et rendant
                    l'authentification des informations incroyablement
                    difficile.
                  </li>
                </ul>
                L'accès à ce "savoir total" a révélé une vulnérabilité fatale :
                la conscience elle-même. Le piratage du Neuro-Cortique a évolué
                rapidement, depuis l'archaïque <em>Pop-up Bomber</em> jusqu'aux
                armes neurologiques sophistiquées :
                <ul className="mt-3 space-y-2">
                  <li className="text-gray-300">
                    • <em>Eïdolon-Glitch</em> : Un virus altérant la perception
                    du pilote. Il injecte des dédoublements, des latences et des
                    fantômes (Eïdolons), rendant l'interface de réalité
                    augmentée illisible en combat.
                  </li>
                  <li className="text-gray-300">
                    • <em>Siphon Mnésique</em> : Un malware invasif conçu pour
                    fouiller et extraire la mémoire de la victime, laissant
                    derrière lui des séquelles neurologiques et des secrets
                    volés.
                  </li>
                </ul>
                Le besoin d'une sécurité revue au gout du jour a ainsi vu naitre
                de nouveaux mastodontes comme <strong>Talos</strong>. Aujourdhui
                le web ne ressemble plus au farwest qu'il a jadis pu être, et
                vous risquez beaucoup moins à vous connectez à votre terminale,
                mais attention, vous trouverez toujours de petits malins pour
                trouver LA faille..
              </p>
            </section>

            {/* Section 2: La géopolitique actuelle */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                La géopolitique actuelle :
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Après la surprenante émergence d'un archipel au large du
                Pacifique nord, renfermant des ressources premières rares dans
                des dimensions interstellaires, la guerre froide opposant la
                Confédération des États Libres (CEL) et la Fédération
                Eurasiatique Unifiée (FEU) se rechauffe considérablement.. :
              </p>
            </section>

            {/* Section 3: Les puissances en présence */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Les puissances en présence :
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* FEU */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-xl font-bold text-red-400 mb-3">
                    Fédération Eurasiatique Unifiée (FEU)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Dirigée par un Conseil Exécutif de 12 membres, la FEU
                    contrôle la majeure partie de l'Eurasie et de l'Afrique du
                    Nord. C'est un régime autoritaire où l'État contrôle
                    étroitement les médias, l'économie et la technologie
                    Syncron. La FEU privilégie l'ordre, la stabilité et
                    l'efficacité militaire, mais au prix de libertés
                    individuelles considérablement réduites.
                  </p>
                </div>

                {/* CEL */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-xl font-bold text-blue-400 mb-3">
                    Confédération des États Libres (CEL)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Une alliance de démocraties libérales regroupant les
                    anciennes nations nord-américaines. La CEL est une structure
                    républicaine et démocratique en apparence, mais elle est
                    minée par la dette systémique et une bureaucratie
                    paralysante. la confédération de plus en plus sous
                    l'influence financière des méga-corporations qui financent
                    son armée et ses infrastructures. On parle de{" "}
                    <em>Ministères Fantômes</em> : des départements entiers du
                    gouvernement de la CEL sont gérés de fait par des cadres de
                    différentes megacorporation, et ceux d'une manière à peine
                    cachée. La CEL défend un idéal qu'elle a déjà vendu.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Les méga-corporations */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Les méga-corporations :
              </h3>

              <div className="space-y-4">
                <h5 className="text-green-400 font-bold mb-3">
                  Aetheria Syncron Dynamics
                </h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Aetheria Syncron Dynamics est née dans la confédération, de la
                  fusion entre Aertheria, une société spécialisé dans
                  l'aeronautique, et Syncron, la société spécialisé dans la
                  technologie de synchronisation humain/net. Aetheria Syncron
                  Dynamics est la plus puissante des mégacorporations. Dirigiée
                  par Siléas Karr, un brillant scientifique devenu entrepreneur,
                  elle a inventé le premier Exosquelette de Combat Amélioré
                  (ECA). Dernierement, elle a fourni à la CEL le dernier modele
                  et ses variantes, le Mante, censé donner un avantage notable
                  dans le conflit..
                </p>

                <h5 className="text-green-400 font-bold mb-3">Talos</h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Talos, une société spécialisé dans la web-sécurité à la base,
                  a su evoluer et s'imposer dans le domaine de la cybernétique.
                  Plus discrète qu'Aetheria Syncron Dynamics, elle a été fondé à
                  la base par un hacker etique de renom : Anya Sharma surnommé
                  "L'impératrice du code". Talos a su rester neutre dans le
                  conflit, en vendant ses services à la fois à la CEL et à la
                  FEU. Talos fabrique desormais les implants neurologiques et
                  les prothèses cybernétiques de la plus haute qualité
                  disponibles sur le marché. Leurs puces 'Synapse Guard' sont
                  essentielles pour prévenir les attaques de feedback
                  neurologique ( souvent causé par l'usage prolongé de la
                  connexion Syncron ) et pour garantir la stabilité de la
                  connexion ECA-Pilote. Ironiquement, même Aetheria doit acheter
                  ces puces à Talos.
                </p>

                <h5 className="text-green-400 font-bold mb-3">
                  Groupe Assault
                </h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Le groupe Assault est la plus ancienne des corporations.
                  Fondée par un groupe d'anciens militaires de la CEL, son
                  créneau était au depart l'armement mais au fur et à mesure de
                  son evolution, et dans un besoin d'indépendance, Groupe
                  Assault s'est diversifié dans de nombreux domaines, y compris
                  l'electronique, l'aeronautique et la recherche spatiale, et la
                  conception d'ECA. Leurs ECA font partie du haut du panier mais
                  c'est surtout dans leurs equipements qu'ils excellent, leurs
                  pieces de modifications, leur fusils, leurs drones et leurs
                  kits de réparation sont les plus recherché tant leurs qualité
                  n'est plus à prouver. Son organisation est presque militaire,
                  un héritage de ses fondateurs.. On ne connait d'ailleurs pas
                  l'identité du dirigeant actuel, mais on sait qu'il est passé
                  par le haut commandant de la CEL.
                </p>

                <h5 className="text-green-400 font-bold mb-3">Devotus</h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Devotus est une société spécialisé dans la biotechnologie. Le
                  tabou que peut representer l'utilisation la cybernetique
                  s'effacant peu à peu grace aux implants Syncron, Devotus
                  cherche à faire evoluer l'humain vers le transhumanisme en
                  créant des solutions bio-technologiques. À l'origine centré
                  sur les protheses visant a remplacer des membres perdus,
                  Devotus c'est vite rendu compte que leur savoir faire leur
                  permettait esperer rendre leurs protheses plus aptes que les
                  membres qu'elles devaient remplacer, ouvrant la porte à la
                  création d'un humain augmenté. Malgrès tout, les effets
                  secondaires se sont montré plus systematiques que ceux à quoi
                  s'attendait l'entreprise s'en est suivit un bad buzz qui a
                  lourdement touché les ventes, mais chez les militaires le
                  sujet Devotus porte à la blague : "Fonce dans l'tas! Au pire
                  tu meurs et au mieu Devotus te remplacera ta jambe ou ton bras
                  par un implant !"
                </p>
              </div>
            </section>

            {/* Section 5: Le théâtre d'opérations */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Le théâtre d'opérations :
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Le conflit s'est cristallisé autour de l'
                <strong>Archipel des Cendres</strong>, un chapelet d'îles
                volcaniques riches en minerais rares.
              </p>
            </section>

            {/* Section 6: Tableau des classes d'ECA */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Classes d'ECA disponibles :
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Classe
                      </th>
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Spécialité
                      </th>
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Avantages
                      </th>
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Inconvénients
                      </th>
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Équipement de base
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-4 text-yellow-400 font-bold">
                        Assault
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Combat rapproché et infiltration
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Excellente mobilité, armement lourd, capacité de
                        camouflage
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Vulnérable aux attaques à distance, autonomie limitée
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Lance-roquettes, Lame énergétique, Système de camouflage
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-4 text-blue-400 font-bold">
                        Sniper
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Combat à longue distance et reconnaissance
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Précision exceptionnelle, portée maximale, capteurs
                        avancés
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Très vulnérable en combat rapproché, temps de
                        déploiement long
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Fusil de précision, Drone de reconnaissance, Kit de
                        survie
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-4 text-red-400 font-bold">
                        Heavy
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Combat frontal et support d'escouade
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Armure renforcée, puissance de feu massive, bouclier
                        énergétique
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Lenteur, consommation énergétique élevée, cible
                        prioritaire
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Mitrailleuse lourde, Bouclier, Lance-missiles
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-4 text-green-400 font-bold">
                        Support
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Logistique et communication
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Capacités de réparation, réseau de communication avancé,
                        stockage d'équipement
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        N'excelle dans aucun domaine, dépend de l'escouade
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Fusil d'assaut modulable, Drones de support, Kit de
                        réparation rapide
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </article>

        {/* Bouton d'action */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => handleChoice("LORE_INTRO", 0)}
            className="btn-primary px-8 py-4 rounded-lg font-bold text-lg hover:ring-2 ring-green-500 transition-all hover:scale-105 shadow-lg">
            ▶ Commencer la Création de Personnage
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoreScreen;
