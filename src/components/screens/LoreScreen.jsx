import useGameStore from "../../store/gameStore.js";
import { useState } from "react";
import SequentialScanner from "../ui/SequentialScanner.jsx";
const LoreScreen = () => {
  const handleChoice = useGameStore((state) => state.handleChoice);
  const [selectedEcaImage, setSelectedEcaImage] = useState(null);

  const ecaImages = {
    Phalange: new URL("/assets/img/Phalange.png", import.meta.url).href,
    Aiguille: new URL("/assets/img/Aiguille.png", import.meta.url).href,
    Eclair: new URL("/assets/img/Eclair.png", import.meta.url).href,
    Omni: new URL("/assets/img/Omni.png", import.meta.url).href,
  };

  const openEcaModal = (ecaName) => {
    setSelectedEcaImage({ name: ecaName, src: ecaImages[ecaName] });
  };

  const closeEcaModal = () => {
    setSelectedEcaImage(null);
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Image de fond fixe qui couvre tout l'écran */}
      <div className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat bg-[url(/assets/img/fond_lore.png)]"></div>

      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40"></div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 p-0">
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
                au réseau mondial, ainsi qu'une interface en realité augmenté permettant son controle. 
                Cette technologie promettait le partage instantané du savoir humain, cependant, le <em>Syncron</em>{" "}
                devint rapidement un outil de division :
                <ul className="mt-3 space-y-2 ml-6">
                  <li className="text-gray-300">
                    • Chez la Fédération Eurasiatique Unifiée (
                    <strong className="text-red-400">FEU</strong>) : Le savoir
                    est filtré. Le réseau est centralisé et hermétique, le
                    rendant fiable pour les données scientifiques pures, mais
                    purgé de toute information allant à l'encontre de la
                    propagande et des dogmes des etat composants.
                  </li>
                  <li className="text-gray-300">
                    • Chez la Confédération des États Libres (
                    <strong className="text-blue-400">CEL</strong>) : Le savoir
                    est pollué. Le réseau est ouvert, mais saturé de publicités
                    intrusives, de théories d'experts auto-proclamés et de
                    désinformation, le rendant opaque et rendant
                    l'authentification des informations incroyablement
                    difficile.
                  </li>
                </ul>
                <br />
                Ce nouveau type de connexion, et cette nouvelle façon de surfer
                le web et consommer la donné a rapidement vu emmerger un nouveau type de
                hacker, le piratage neuro-cortique, évoluant rapidement, de
                l'archaïque <em>Pop-up Bomber</em> jusqu'aux armes neurologiques
                sophistiquées :
                <ul className="mt-3 space-y-2 ml-6">
                  <li className="text-gray-300">
                    •
                    <em
                      className="glitch"
                      title="Eïdolon-Glitch"
                      data-glitch="Ȩ̸͠ï̸͈̐d̴̟̄ó̷͎l̶͈̕ǫ̷̇n̷͚̂-̴̧͂G̷̝̈́l̷͗͜ǐ̸͉ẗ̸̥́c̸̣̑h̶̯͆">
                      Eïdolon-Glitch
                    </em>{" "}
                    : Un virus altérant la perception de la personne visée. Il
                    injecte des dédoublements, des spectres, les dernieres
                    versions peuvent même ajouter à cela des acouphènes
                    amplifiés.
                  </li>
                  <li className="text-gray-300">
                    • <SequentialScanner /> : Un malware invasif conçu pour
                    fouiller et extraire la mémoire de la victime, laissant
                    derrière lui des séquelles neurologiques et des secrets
                    volés, voir altérés.
                  </li>
                </ul>
                Le besoin d'une sécurité revue au gout du jour a ainsi vu naitre
                de nouveaux mastodontes comme <strong>Talos</strong>. Aujourdhui
                le web ne ressemble plus au farwest qu'il a jadis pu être, et
                vous risquez beaucoup moins de vous griller les synapses en vous
                connectant à votre terminale, mais attention ! Vous trouverez
                toujours de petits malins pour trouver LA faille..
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Dans les domaines militaires, L'invention de l'Exosquelette de
                Combat Amélioré (<strong>ECA</strong>) par{" "}
                <em>Aetheria Syncron Dynamics</em> a révolutionné la guerre. Ces
                armures de taille humaine ne sont pas de simples protections,
                elles sont des extensions nerveuses et musculaires de
                l'opérateur, capables de décupler sa force, son agilité et sa
                vitesse. L'ECA est une symbiose : l'armure amplifie les
                capacités de l'opérateur amplifiant ainsi les différences
                infimes entre humains. Un soldat doté d'une aptitude naturelle
                de 7/10 verra cette aptitude effective multiplié à 70, tandis
                qu'un autre à 6/10 atteindra 60. Comme nous venons de le voir,
                les ecarts minimes entre 2 soldats se voient décuplés, un
                entraînement intensif connu sous le nom de Conditionnement
                Synchronique est devenu l'unique critère de survie. Ce processus
                brutal pousse le corps et l'esprit à la limite, enseignant à
                l'opérateur la maîtrise de l'armure, de sa synchronisation avec
                elle, tout en cherchant a ameliorer la condition physique du
                soldat. Seule une élite de combattants surhumains, capable de
                soutenir cette symbiose, est acceptée au sein des escouades
                spécialisées.
              </p>
            </section>

            {/* Section 2: La géopolitique actuelle */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                La géopolitique actuelle :
              </h3>
              <p className="text-gray-300 leading-relaxed">
                À la moitier du XXIeme siecle, un archipel a, dans las stupeur
                générale, émmergé de l'ocean Pacifique Nord dans les zones
                internationales. La surprise et la curiosité passées, ses
                volcans très actifs et son environnement plutot inhospitalier
                ont vite fait de détourner l'attention des puissances mondiales,
                on l'a d'ailleurs nommé <em>l'Archipel des Cendres</em>. Au
                debut du XXIIe siecle, et grace à l'accalmie des activités
                volcaniques sur place, une expedition dirigé par la professeur
                Zara Khan a pu sonder le sol et s'est rendu compte que celui-ci
                renfermait bon nombre de gisements de minerais rares d'une
                profondeur abyssale. Loin d'apaiser les tensions entre la
                Fédération Eurasiatique Unifiée <strong>FEU</strong> et la
                Confédération des États Libres <strong>CEL</strong> deja en
                guerre froide, cette révélation agit comme l'étincelle embrasant
                la poudrière, déclenchant un affrontement direct autour de
                l'archipel, assez de batailles furent remporter par le CEL pour
                y construire une base lui permettant d'assoir sa temporaire
                domination.
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
                    Fédération Eurasiatique Unifiée (
                    <strong className="text-red-400">FEU</strong>)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Dirigée par un Conseil Exécutif de 12 membres, la{" "}
                    <strong className="text-red-400">FEU</strong> contrôle la
                    majeure partie de l'Eurasie et de l'Afrique du Nord. C'est
                    un régime autoritaire où l'État contrôle étroitement les
                    médias, l'économie et la technologie Syncron. La{" "}
                    <strong className="text-red-400">FEU</strong> privilégie
                    l'ordre, la stabilité et l'efficacité militaire, mais au
                    prix de libertés individuelles considérablement réduites.
                  </p>
                </div>

                {/* CEL */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-xl font-bold text-blue-400 mb-3">
                    Confédération des États Libres (
                    <strong className="text-blue-400">CEL</strong>)
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Une alliance de démocraties libérales regroupant les
                    anciennes nations nord-américaines. La{" "}
                    <strong className="text-blue-400">CEL</strong> est une
                    structure républicaine et démocratique en apparence, mais
                    elle est minée par la dette systémique et une bureaucratie
                    paralysante. la confédération de plus en plus sous
                    l'influence financière des méga-corporations qui financent
                    son armée et ses infrastructures. On parle de Ministères
                    Fantômes : des départements entiers du gouvernement de la{" "}
                    <strong className="text-blue-400">CEL</strong> sont gérés de
                    fait par des cadres de différentes megacorporation, et ceux
                    d'une manière à peine cachée. La{" "}
                    <strong className="text-blue-400">CEL</strong> défend un
                    idéal qu'elle a déjà vendu.
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
                  (ECA). Dernierement, elle a fourni à la{" "}
                  <strong className="text-blue-400">CEL</strong> le dernier
                  modele et ses variantes, le Mante, censé donner un avantage
                  notable dans le conflit..
                </p>

                <h5 className="text-green-400 font-bold mb-3">Talos</h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Talos, une société spécialisé dans la web-sécurité à la base,
                  a su evoluer et s'imposer dans le domaine de la cybernétique.
                  Plus discrète qu'Aetheria Syncron Dynamics, elle a été fondé à
                  la base par un hacker etique de renom : Anya Sharma surnommé
                  "L'impératrice du code". Talos a su rester neutre dans le
                  conflit, en vendant ses services à la fois à la{" "}
                  <strong className="text-blue-400">CEL</strong> et à la{" "}
                  <strong className="text-red-400">FEU</strong>. Talos fabrique
                  desormais les implants neurologiques et les prothèses
                  cybernétiques de la plus haute qualité disponibles sur le
                  marché. Leurs puces 'Synapse Guard' sont essentielles pour
                  prévenir les attaques de feedback neurologique ( souvent causé
                  par l'usage prolongé de la connexion Syncron ) et pour
                  garantir la stabilité de la connexion ECA-Pilote.
                  Ironiquement, même Aetheria doit acheter ces puces à Talos.
                </p>

                <h5 className="text-green-400 font-bold mb-3">
                  Groupe Assault
                </h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Le groupe Assault est la plus ancienne des corporations.
                  Fondée par un groupe d'anciens militaires de la{" "}
                  <strong className="text-blue-400">CEL</strong>, son créneau
                  était au depart l'armement mais au fur et à mesure de son
                  evolution, et dans un besoin d'indépendance, Groupe Assault
                  s'est diversifié dans de nombreux domaines, y compris
                  l'electronique, l'aeronautique et la recherche spatiale, et la
                  conception d'ECA. Leurs ECA font partie du haut du panier mais
                  c'est surtout dans leurs equipements qu'ils excellent, leurs
                  pieces de modifications, leur fusils, leurs drones et leurs
                  kits de réparation sont les plus recherché tant leurs qualité
                  n'est plus à prouver. Son organisation est presque militaire,
                  un héritage de ses fondateurs.. On ne connait d'ailleurs pas
                  l'identité du dirigeant actuel, mais on sait qu'il est passé
                  par le haut commandant de la{" "}
                  <strong className="text-blue-400">CEL</strong>.
                </p>

                <h5 className="text-green-400 font-bold mb-3">Devotus</h5>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Devotus est une société spécialisé dans la biotechnologie. Le
                  tabou que peut representer l'utilisation de la cybernetique
                  s'effacant peu à peu grace aux implants Syncron, Devotus
                  cherche à faire evoluer l'humain vers le transhumanisme en
                  créant des solutions bio-technologiques. À l'origine centré
                  sur les protheses visant a remplacer des membres perdus,
                  Devotus c'est vite rendu compte que leur savoir faire leur
                  permettait esperer rendre leurs protheses plus aptes que les
                  membres qu'elles devaient remplacer, ouvrant la porte à la
                  création d'un humain augmenté. Malgrès tout, les effets
                  secondaires se sont montré plus systematiques que ceux à quoi
                  s'attendait l'entreprise, s'en est suivit un bad buzz qui a
                  lourdement touché les ventes. Malgrès tout, les militaires
                  tournèrent cela à la blague : "Alors, on a la jambe qui se met
                  en mode 'danse robotique' en plein combat ? Écoute, c'est pas
                  un effet secondaire, c'est juste la mise à jour 3.4 qui a
                  crashé le firmware. Essaie de l'éteindre et de la rallumer, ça
                  marche toujours."
                </p>
              </div>
            </section>

            {/* Section 6: Tableau des classes d'ECA */}
            <section>
              <h3 className="text-2xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                Classes d'ECA disponibles :
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 p-4 text-left text-green-400 font-bold">
                        Apperçu
                      </th>
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
                      <td className="border border-gray-600 p-2">
                        <button
                          onClick={() => openEcaModal("Phalange")}
                          className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-gray-600 hover:border-green-400 transition-colors overflow-hidden group">
                          <img
                            src={ecaImages.Phalange}
                            alt="Phalange"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </td>
                      <td className="border border-gray-600 p-4 text-green-300 font-bold">
                        Phalange
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Assaut Lourd / Anti - Blindage
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Force brute, Résistance Maximale
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Lenteur au déploiement, faible Agilité.
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Lance-roquettes, Lame énergétique, Bouclier balistique.
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-2">
                        <button
                          onClick={() => openEcaModal("Aiguille")}
                          className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-gray-600 hover:border-green-400 transition-colors overflow-hidden group">
                          <img
                            src={ecaImages.Aiguille}
                            alt="Aiguille"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </td>
                      <td className="border border-gray-600 p-4 text-green-300 font-bold">
                        Aiguille
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Tireur d'élite / Combat à Distance
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Agilité extrême, Précision de tir, Mouvement furtif.
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Blindage minimal, Faible puissance au CàC.
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Fusil de precision, Optiques avancées, Modules de
                        furtivité, Lames de survie (pour dernier recours au Corp
                        à Corp).
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-2">
                        <button
                          onClick={() => openEcaModal("Eclair")}
                          className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-gray-600 hover:border-green-400 transition-colors overflow-hidden group">
                          <img
                            src={ecaImages.Eclair}
                            alt="Eclair"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </td>
                      <td className="border border-gray-600 p-4 text-green-300 font-bold">
                        Eclair
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Commando/Pose de piege sur le terrain
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Vitesse de pointe, Capacités de déploiement tactique,
                        Efficacité Corp à Corp.
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Consommation d'énergie massive, Blindage moyen.
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Lance drone grenade/mines, SMG tactiques, Lames de
                        combat
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/50">
                      <td className="border border-gray-600 p-2">
                        <button
                          onClick={() => openEcaModal("Omni")}
                          className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-gray-600 hover:border-green-400 transition-colors overflow-hidden group">
                          <img
                            src={ecaImages.Omni}
                            alt="Omni"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </td>
                      <td className="border border-gray-600 p-4 text-green-300 font-bold">
                        Omni
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Soutien / Commandement
                      </td>
                      <td className="border border-gray-600 p-4 text-gray-300">
                        Équilibre, capacités C³ (commandement, contrôle,
                        communication).
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

      {/* Modal pour afficher l'image ECA en grand */}
      {selectedEcaImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeEcaModal}>
          <div
            className="relative bg-gray-800 rounded-lg border border-gray-600 max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* En-tête du modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h3 className="text-xl font-bold text-green-400">
                ECA {selectedEcaImage.name}
              </h3>
              <button
                onClick={closeEcaModal}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors">
                ×
              </button>
            </div>

            {/* Image */}
            <div className="p-4">
              <img
                src={selectedEcaImage.src}
                alt={`ECA ${selectedEcaImage.name}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoreScreen;
