export const translations = {
    fr: {
        title: 'Visualisateur de Graphe',
        graphTypes: {
            undirected: 'Non Orienté',
            directed: 'Orienté',
            weighted: 'Pondéré',
        },
        algorithms: {
            title: 'Algorithme',
            none: 'Aucun',
            dfs: 'Parcours en profondeur (DFS)',
            bfs: 'Parcours en largeur (bfs)',
            dijkstra: 'Dijkstra',
        },
        buttons: {
            reset: 'Réinitialiser',
            removeStart: 'Retirer le nœud de départ',
            runAlgorithm: 'Lancer l\'Algorithme',
        },
        messages: {
            startNode: 'Nœud de départ',
            addNodes: 'Cliquez sur le canevas pour ajouter des nœuds. Cliquez sur deux nœuds pour les connecter. Ensuite, sélectionnez un algorithme.',
            selectStart: 'Sélectionnez un nœud de départ pour l\'algorithme.',
            running: 'L\'algorithme est en cours d\'exécution...',
            readyToRun: 'Cliquez sur "Lancer l\'Algorithme" pour commencer la visualisation.',
            weightedNote: 'NE MARCHE PAS MAIS J\'Y TRAVAIL : Double-cliquez sur une arête pour modifier son poids.',
        },
        legend: {
            title: 'Légende :',
            unvisited: 'Non visité',
            visiting: 'En cours',
            visited: 'Visité',
        }
    },
    en: {
        title: 'Graph Visualizer',
        graphTypes: {
            undirected: 'Undirected',
            directed: 'Directed',
            weighted: 'Weighted',
        },
        algorithms: {
            title: 'Algorithm',
            none: 'None',
            dfs: 'DFS',
            bfs: 'BFS',
            dijkstra: 'Dijkstra',
        },
        buttons: {
            reset: 'Reset',
            removeStart: 'Remove Start Node',
            runAlgorithm: 'Run Algorithm',
        },
        messages: {
            startNode: 'Start Node',
            addNodes: 'Click on canvas to add nodes. Click two nodes to connect them. Then select an algorithm.',
            selectStart: 'Select a start node for the algorithm.',
            running: 'Algorithm is running...',
            readyToRun: 'Click "Run Algorithm" to start visualization.',
            weightedNote: 'NOT WORKING BUT I WORK ON IT :) Double-click on an edge to modify its weight.',
        },
        legend: {
            title: 'Legend:',
            unvisited: 'Unvisited',
            visiting: 'Visiting',
            visited: 'Visited',
        }
    }
};
