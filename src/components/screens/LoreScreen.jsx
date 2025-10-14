import useGameStore from "../../store/gameStore.js";

const LoreScreen = () => {
  const handleChoice = useGameStore((state) => state.handleChoice);

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative bg-[url(/assets/img/fond lore.png)] h-screen bg-fixed bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <header className="text-center border-b-2 border-green-500/30 pb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          Le Cycle de Prométhée
        </h2>
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Confidentiel - Accès Opérateur Uniquement
        </p>
      </header>

      {/* Contenu principal */}
      <article className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Section Introduction */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              Introduction
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
Le XXIIe siècle a inauguré l'ère de la Neuro-Technologie. La percée fut la création du Neuro-Cortique <em>Syncron</em>, un implant neurologique permettant la connexion directe de l'esprit au réseau mondial. Cette technologie promettait le partage instantané du savoir humain.
Cependant, le <em>Syncron</em> devint rapidement un outil de division :
              <ul>
<li>Chez la Fédération Eurasiatique Unifiée (FEU) : Le savoir est filtré. Le réseau est centralisé et hermétique, le rendant fiable pour les données scientifiques pures, mais purgé de toute information allant à l'encontre de la propagande et du dogme nationaliste.</li>
<li>Chez la Confédération des États Libres (CEL) : Le savoir est pollué. Le réseau est ouvert, mais saturé de publicités intrusives, de théories d'experts auto-proclamés et de désinformation, le rendant opaque et rendant l'authentification des informations incroyablement difficile.</li>
                </ul>
L'accès à ce "savoir total" a révélé une vulnérabilité fatale : la conscience elle-même. Le piratage du Neuro-Cortique a évolué rapidement, depuis l'archaïque <em>Pop-up Bomber</em> jusqu'aux armes neurologiques sophistiquées :
              <ul>
<li><em>Eïdolon-Glitch</em> : Un virus altérant la perception du pilote. Il injecte des dédoublements, des latences et des fantômes (Eïdolons), rendant l'interface de réalité augmentée illisible en combat.</li>
<li><em>Siphon Mnésique</em> : Un malware invasif conçu pour fouiller et extraire la mémoire de la victime, laissant derrière lui des séquelles neurologiques et des secrets volés.</li>
              </ul>
              Le besoin d'une sécurité revue au gout du jour a ainsi vu naitre de
              nouveaux mastodontes comme <strong>Talos</strong>. Aujourdhui le web ne ressemble
              plus au farwest qu'il a jadis pu être, et vous risquez beaucoup moins
              à vous connectez à votre terminale, mais attention, vous trouverez
              toujours de petits malins pour trouver LA faille..
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Dans le domaine de l'armement, l'invention de l'Exosquelette de
              Combat Amélioré (ECA), a révolutionné la guerre. Ces armures de
              taille humaine ne sont pas de simples véhicules ; elles sont des
              extensions nerveuses et musculaires de l'opérateur, capables de
              décupler la force, l'agilité et la vitesse de l'hôte.
            </p>
            <p className="text-gray-300 leading-relaxed">
              L'ECA est une symbiose : l'armure amplifie les capacités de
              l'opérateur, mais elle amplifie aussi les différences infimes
              entre humains. Un soldat doté d'une Aptitude naturelle de 7/10
              verra son score effectif multiplié à 70, tandis qu'un autre à 6/10
              atteindra 60. L'écart est considérable en combat, transformant les
              secondes en abîmes.
            </p>
          </section>

          {/* Section Conditionnement */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              Conditionnement Synchronique
            </h3>
            <p className="text-gray-300 leading-relaxed">
              L'entraînement intensif, connu sous le nom de{" "}
              <strong>Conditionnement Synchronique</strong>, est devenu l'unique
              critère de survie. Ce processus brutal pousse le corps et l'esprit
              à la limite, enseignant à l'opérateur la Maîtrise de la Mante,
              c'est-à-dire la capacité à maintenir la connexion neuromusculaire
              à pleine puissance sans subir de dégâts neurologiques internes.
              Seule une élite de combattants surhumains, capable de soutenir
              cette symbiose, est acceptée au sein des escouades spécialisées.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              La géopolitique actuelle :
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Après la surprenante émergence d'un archipel au large du Pacifique
              nord, renfermant des ressources premières rares dans des dimensions
              interstellaires, la guerre froide opposant la Confédération des
              États Libres (CEL) et la Fédération Eurasiatique Unifiée (FEU) se
              rechauffe considérablement.. :
            </p>
          </section>
          {/* Section Factions */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              Les Factions en Guerre
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  La Confédération des États Libres (CEL)
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Regroupant les anciennes puissances occidentales et
                  nord-américaines. La CEL est une structure républicaine et
                  démocratique en apparence, mais elle est minée par la dette
                  systémique et une bureaucratie paralysante. la confédération de plus en plus sous l'influence financière des
                  méga-corporations qui financent son armée et ses
                  infrastructures. On parle de <em>Ministères Fantômes</em> :
                  des départements entiers du gouvernement de la CEL sont gérés
                  de fait par des cadres de différentes megacorporation, et ceux d'une manière à peine cachée.
                  La CEL défend un idéal qu'elle a déjà vendu.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  La Fédération Eurasiatique Unifiée (FEU)
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Un bloc autoritaire et nationaliste, regroupant l'Est de
                  l'Europe et la majeure partie de l'Asie. La FEU est jeune,
                  agressive et militairement cohésive, soutenue par une
                  idéologie de supériorité territoriale. Elle cherche à
                  remplacer la CEL comme puissance hégémonique mondiale,
                  exploitant l'épuisement des démocraties. Ses ECA de
                  conception, bien que moins agiles que ceux de la CEL, sont
                  plus robustes, axés sur la puissance brute et la résilience.
                </p>
              </div>
            </div>
          </section>

          {/* Section Aetheria */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              Les Mégacorporations
            </h3>
            <h5 className="text-green-400 font-bold mb-3">
              Aetheria Syncron Dynamics
            </h5>
            <p className="text-gray-300 leading-relaxed mb-3">
              Aetheria Syncron Dynamics est née dans
              la confédération, de la fusion entre Aertheria, une société
              spécialisé dans l'aeronautique, et Syncron, la société spécialisé
              dans la technologie de synchronisation humain/net. Aetheria
              Syncron Dynamics est la plus puissante des mégacorporations.
              Dirigiée par Siléas Karr, un brillant scientifique devenu
              entrepreneur, elle a inventé le premier Exosquelette de Combat
              Amélioré (ECA). Dernierement, elle a fourni à la CEL le dernier
              modele et ses variantes, le Mante, censé donner un avantage
              notable dans le conflit..
            </p>
            <h5 className="text-green-400 font-bold mb-3">
              Talos
            </h5>
            <p className="text-gray-300 leading-relaxed mb-3">
              Talos, une société spécialisé dans la web-sécurité à la
              base, a su evoluer et s'imposer dans le domaine de la
              cybernétique. Plus discrète qu'Aetheria Syncron Dynamics, elle a
              été fondé à la base par un hacker etique de renom : Anya Sharma
              surnommé "L'impératrice du code". Talos a su rester neutre dans le
              conflit, en vendant ses services à la fois à la CEL et à la FEU.
              Talos fabrique desormais les implants neurologiques et les
              prothèses cybernétiques de la plus haute qualité disponibles sur
              le marché. Leurs puces 'Synapse Guard' sont essentielles pour
              prévenir les attaques de feedback neurologique ( souvent causé par
              l'usage prolongé de la connexion Syncron ) et pour garantir la
              stabilité de la connexion ECA-Pilote. Ironiquement, même Aetheria
              doit acheter ces puces à Talos.
            </p>
            <h5 className="text-green-400 font-bold mb-3">
            Groupe Assault
            </h5>
            <p className="text-gray-300 leading-relaxed mb-3">
              Le groupe Assault est la plus ancienne des
              corporations. Fondée par un groupe d'anciens militaires de la CEL,
              son créneau était au depart l'armement mais au fur et à mesure de
              son evolution, et dans un besoin d'indépendance, Groupe Assault
              s'est diversifié dans de nombreux domaines, y compris
              l'electronique, l'aeronautique et la recherche spatiale, et la
              conception d'ECA. Leurs ECA font partie du haut du panier mais
              c'est surtout dans leurs equipements qu'ils excellent, leurs
              pieces de modifications, leur fusils, leurs drones et leurs kits
              de réparation sont les plus recherché tant leurs qualité n'est
              plus à prouver. Son organisation est presque militaire, un
              héritage de ses fondateurs.. On ne connait d'ailleurs pas
              l'identité du dirigeant actuel, mais on sait qu'il est passé par
              le haut commandant de la CEL.
            </p>
            <h5 className="text-green-400 font-bold mb-3">
            Devotus 
            </h5>
            <p className="text-gray-300 leading-relaxed mb-3">
              Devotus est une société spécialisé dans la biotechnologie.
              Le tabou que peut representer l'utilisation la cybernetique
              s'effacant peu à peu grace aux implants Syncron, Devotus cherche à
              faire evoluer l'humain vers le transhumanisme en créant des
              solutions bio-technologiques. À l'origine centré sur les protheses visant a remplacer des membres perdus, 
              Devotus c'est vite rendu compte que leur savoir faire leur permettait esperer rendre leurs protheses plus aptes que les membres qu'elles devaient remplacer, 
              ouvrant la porte à la création d'un humain augmenté. Malgrès tout, les effets secondaires se sont montré plus systematiques que ceux à quoi s'attendait l'entreprise s'en est suivit un bad buzz qui a lourdement touché les ventes, mais chez les militaires le sujet Devotus
              porte à la blague : "Fonce dans l'tas! Au pire tu meurs et au mieu
              Devotus te remplacera ta jambe ou ton bras par un implant !"
            </p>
          </section>

          {/* Section Archipel */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
              Acte I : Les Guerres de l'Archipel
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Le conflit s'est cristallisé autour de l'
              <strong>Archipel des Cendres</strong>, un chapelet d'îles
              volcaniques riches en minerais rares.
            </p>
          </section>

          {/* Tableau des Escouades */}
          <section>
            <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-gray-700 pb-2">
              Composition des Escouades ECA (Mantes)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 border-b-2 border-green-500">
                    <th className="text-left p-4 text-green-400 font-bold">
                      Type d'ECA
                    </th>
                    <th className="text-left p-4 text-green-400 font-bold">
                      Rôle Principal
                    </th>
                    <th className="text-left p-4 text-green-400 font-bold">
                      Avantages
                    </th>
                    <th className="text-left p-4 text-green-400 font-bold">
                      Inconvénients
                    </th>
                    <th className="text-left p-4 text-green-400 font-bold">
                      Armement Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-bold text-white">Phalange</td>
                    <td className="p-4 text-gray-300">
                      Assaut Lourd / Anti-Blindage
                    </td>
                    <td className="p-4 text-gray-300">
                      Force brute (×10), Résistance Maximale
                    </td>
                    <td className="p-4 text-gray-300">
                      Lenteur au déploiement, faible Agilité
                    </td>
                    <td className="p-4 text-gray-300">
                      Lance-roquettes, Gatling lourd, Bouclier balistique
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-bold text-white">Aiguille</td>
                    <td className="p-4 text-gray-300">
                      Reconnaissance / CQC (Corps-à-Corps)
                    </td>
                    <td className="p-4 text-gray-300">
                      Agilité extrême (×10), Finesse de Mouvement
                    </td>
                    <td className="p-4 text-gray-300">
                      Blindage minimal, faible Force de frappe directe
                    </td>
                    <td className="p-4 text-gray-300">
                      Lames énergétiques, Fusil de précision, Grappins
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-bold text-white">Éclair</td>
                    <td className="p-4 text-gray-300">
                      Flanc / Interception Rapide
                    </td>
                    <td className="p-4 text-gray-300">
                      Vitesse de pointe (×10), manœuvres d'évitement
                    </td>
                    <td className="p-4 text-gray-300">
                      Consommation d'énergie massive, signature thermique élevée
                    </td>
                    <td className="p-4 text-gray-300">
                      SMG lourds, Lance-flammes tactiques
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-bold text-white">Omni</td>
                    <td className="p-4 text-gray-300">
                      Soutien / Commandement
                    </td>
                    <td className="p-4 text-gray-300">
                      Équilibre, capacités C³ (commandement, contrôle,
                      communication)
                    </td>
                    <td className="p-4 text-gray-300">
                      N'excelle dans aucun domaine, dépend de l'escouade
                    </td>
                    <td className="p-4 text-gray-300">
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
