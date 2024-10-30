import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Languages, PlayCircle, Trash2, X } from 'lucide-react';
import { translations } from '@/lib/translation';

interface Node {
    id: number;
    x: number;
    y: number;
    label: string;
    state?: 'unvisited' | 'visiting' | 'visited';
}

interface Edge {
    id: number;
    source: number;
    target: number;
    weight: number;
    state?: 'unvisited' | 'visiting' | 'visited';
}

type GraphType = 'undirected' | 'directed' | 'weighted';
type AlgorithmType = 'none' | 'dfs' | 'bfs' | 'dijkstra';

const GraphVisualizer: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [graphType, setGraphType] = useState<GraphType>('undirected');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [algorithm, setAlgorithm] = useState<AlgorithmType>('none');
    const [isRunning, setIsRunning] = useState(false);
    const [startNode, setStartNode] = useState<number | null>(null);
    const [language, setLanguage] = useState<'fr' | 'en'>('fr');
    const t = translations[language];


    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Fonctions utilitaires pour les algorithmes
    const getNeighbors = (nodeId: number): number[] => {
        return edges
            .filter(edge => {
                if (graphType === 'directed') {
                    return edge.source === nodeId;
                }
                return edge.source === nodeId || edge.target === nodeId;
            })
            .map(edge => edge.source === nodeId ? edge.target : edge.source);
    };

    const getEdgeWeight = (source: number, target: number): number => {
        const edge = edges.find(e =>
            (e.source === source && e.target === target) ||
            (graphType !== 'directed' && e.source === target && e.target === source)
        );
        return edge ? edge.weight : Infinity;
    };

    const LanguageSelector = () => (
        <Select value={language} onValueChange={(value: 'fr' | 'en') => setLanguage(value)}>
            <SelectTrigger className="w-32">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue>
                    {language === 'fr' ? 'Français' : 'English'}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
            </SelectContent>
        </Select>
    );


    // Implémentation de DFS
    const dfs = async (startNodeId: number) => {
        setIsRunning(true);
        const visited = new Set<number>();

        const dfsRecursive = async (nodeId: number) => {
            if (visited.has(nodeId)) return;

            visited.add(nodeId);
            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === nodeId ? { ...node, state: 'visiting' } : node
                ));
            });

            await delay(500);

            const neighbors = getNeighbors(nodeId);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    flushSync(() => {
                        setEdges(prev => prev.map(edge => {
                            if ((edge.source === nodeId && edge.target === neighbor) ||
                                (edge.target === nodeId && edge.source === neighbor)) {
                                return { ...edge, state: 'visiting' };
                            }
                            return edge;
                        }));
                    });

                    await dfsRecursive(neighbor);

                    // Après la récursion, marquer l'arête comme visitée
                    flushSync(() => {
                        setEdges(prev => prev.map(edge => {
                            if ((edge.source === nodeId && edge.target === neighbor) ||
                                (edge.target === nodeId && edge.source === neighbor)) {
                                return { ...edge, state: 'visited' };
                            }
                            return edge;
                        }));
                    });
                }
            }

            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === nodeId ? { ...node, state: 'visited' } : node
                ));
            });
        };

        await dfsRecursive(startNodeId);
        setIsRunning(false);
    };

    // Implémentation de BFS
    const bfs = async (startNodeId: number) => {
        setIsRunning(true);
        const visited = new Set<number>();
        const queue: number[] = [startNodeId];
        visited.add(startNodeId);

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === nodeId ? { ...node, state: 'visiting' } : node
                ));
            });

            await delay(500);

            const neighbors = getNeighbors(nodeId);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);

                    flushSync(() => {
                        setEdges(prev => prev.map(edge => {
                            if ((edge.source === nodeId && edge.target === neighbor) ||
                                (edge.target === nodeId && edge.source === neighbor)) {
                                return { ...edge, state: 'visiting' };
                            }
                            return edge;
                        }));
                    });
                }
            }

            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === nodeId ? { ...node, state: 'visited' } : node
                ));
            });
        }

        setIsRunning(false);
    };

    // Implémentation de Dijkstra
    const dijkstra = async (startNodeId: number) => {
        setIsRunning(true);
        const distances: { [key: number]: number } = {};
        const previous: { [key: number]: number | null } = {};
        const unvisited = new Set<number>();

        // Initialisation
        nodes.forEach(node => {
            distances[node.id] = node.id === startNodeId ? 0 : Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });

        while (unvisited.size > 0) {
            // Trouver le nœud non visité avec la plus petite distance
            let currentNode = Array.from(unvisited).reduce((a, b) =>
                distances[a] < distances[b] ? a : b
            );

            if (distances[currentNode] === Infinity) break;

            unvisited.delete(currentNode);
            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === currentNode ? { ...node, state: 'visiting' } : node
                ));
            });

            await delay(500);

            // Mettre à jour les distances pour tous les voisins
            const neighbors = getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!unvisited.has(neighbor)) continue;

                const distance = distances[currentNode] + getEdgeWeight(currentNode, neighbor);
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previous[neighbor] = currentNode;

                    flushSync(() => {
                        setEdges(prev => prev.map(edge => {
                            if ((edge.source === currentNode && edge.target === neighbor) ||
                                (edge.target === currentNode && edge.source === neighbor)) {
                                return { ...edge, state: 'visiting' };
                            }
                            return edge;
                        }));
                    });
                }
            }

            flushSync(() => {
                setNodes(prev => prev.map(node =>
                    node.id === currentNode ? { ...node, state: 'visited' } : node
                ));
            });
        }

        setIsRunning(false);
    };

    const runAlgorithm = async () => {
        if (startNode === null || isRunning) return;

        // Reset states
        flushSync(() => {
            setNodes(prev => prev.map(node => ({ ...node, state: 'unvisited' })));
            setEdges(prev => prev.map(edge => ({ ...edge, state: 'unvisited' })));
        });

        switch (algorithm) {
            case 'dfs':
                await dfs(startNode);
                break;
            case 'bfs':
                await bfs(startNode);
                break;
            case 'dijkstra':
                await dijkstra(startNode);
                break;
            default:
                break;
        }
    };

    // Reste du code de visualisation...
    const addNode = useCallback((x: number, y: number): void => {
        setNodes(prevNodes => {
            const newNode: Node = {
                id: prevNodes.length,
                x,
                y,
                label: String(prevNodes.length),
                state: 'unvisited'
            };
            return [...prevNodes, newNode];
        });
    }, []);

    const addEdge = useCallback((source: number, target: number): void => {
        if (source !== target) {
            setEdges(prevEdges => {
                const newEdge: Edge = {
                    id: prevEdges.length,
                    source,
                    target,
                    weight: 1,
                    state: 'unvisited'
                };
                return [...prevEdges, newEdge];
            });
        }
    }, []);

    const onCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
        if (isRunning) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedNode === null) {
            addNode(x, y);
        } else {
            setSelectedNode(null);
        }
    }, [addNode, selectedNode, isRunning]);

    const onNodeClick = useCallback((e: React.MouseEvent, nodeId: number): void => {
        e.stopPropagation();
        if (isRunning) return;

        if (algorithm !== 'none' && startNode === null) {
            setStartNode(nodeId);
        } else if (selectedNode === null) {
            setSelectedNode(nodeId);
        } else if (selectedNode !== nodeId) {
            addEdge(selectedNode, nodeId);
            setSelectedNode(null);
        } else if (selectedNode === nodeId) {
            setSelectedNode(null);
        } else if (startNode === nodeId) {
            setStartNode(null);
        }
    }, [selectedNode, addEdge, algorithm, startNode, isRunning]);

    const clearGraph = (): void => {
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setStartNode(null);
    };

    const getNodeColor = (state?: string) => {
        switch (state) {
            case 'visiting':
                return 'bg-yellow-500';
            case 'visited':
                return 'bg-green-500';
            default:
                return 'bg-slate-800';
        }
    };

    const getEdgeColor = (state?: string, isStartNode?: boolean) => {
        if (isStartNode) {
            return 'bg-blue-600 ring-4 ring-blue-300 shadow-lg';
        }
        switch (state) {
            case 'visiting':
                return '#eab308';
            case 'visited':
                return '#22c55e';
            default:
                return '#1e293b';
        }
    };
    const deleteNode = useCallback((nodeId: number): void => {
        if (isRunning) return;

        // Supprimer les arêtes connectées au nœud
        setEdges(prevEdges => prevEdges.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        ));

        // Supprimer le nœud et mettre à jour les IDs et labels des nœuds restants
        setNodes(prevNodes => {
            const filteredNodes = prevNodes.filter(node => node.id !== nodeId);
            return filteredNodes.map((node, index) => ({
                ...node,
                id: index,
                label: String(index)
            }));
        });

        // Réinitialiser la sélection si nécessaire
        if (selectedNode === nodeId) setSelectedNode(null);
        if (startNode === nodeId) setStartNode(null);
    }, [isRunning, selectedNode, startNode]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <LanguageSelector />
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Select value={graphType} onValueChange={(value: GraphType) => setGraphType(value)}>

                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={t.graphTypes.undirected} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="undirected">{t.graphTypes.undirected}</SelectItem>
                                <SelectItem value="directed">{t.graphTypes.directed}</SelectItem>
                                <SelectItem value="weighted">{t.graphTypes.weighted}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={algorithm} onValueChange={(value: AlgorithmType) => {
                            setAlgorithm(value);
                            setStartNode(null);
                        }}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={t.algorithms.title} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t.algorithms.none}</SelectItem>
                                <SelectItem value="dfs">{t.algorithms.dfs}</SelectItem>
                                <SelectItem value="bfs">{t.algorithms.bfs}</SelectItem>
                                <SelectItem value="dijkstra">{t.algorithms.dijkstra}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={clearGraph}
                            disabled={isRunning}
                        >
                            <Trash2 className="w-4 h-4" />
                            {t.buttons.reset}
                        </Button>

                        {algorithm !== 'none' && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => setStartNode(null)}
                                    disabled={!startNode || isRunning}
                                >
                                    <X className="w-4 h-4" />
                                    {t.buttons.removeStart}
                                </Button>
                                <Button
                                    className="gap-2"
                                    onClick={runAlgorithm}
                                    disabled={startNode === null || isRunning}
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    {t.buttons.runAlgorithm}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div
                        className="w-full h-96 border rounded-lg bg-white cursor-crosshair relative"
                        onClick={onCanvasClick}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {edges.map(edge => {
                                const source = nodes.find(node => node.id === edge.source);
                                const target = nodes.find(node => node.id === edge.target);
                                if (!source || !target) return null;

                                return (
                                    <g key={edge.id}>
                                        <line
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={getEdgeColor(edge.state)}
                                            strokeWidth={2}
                                        />
                                        {graphType === 'directed' && (
                                            <polygon
                                                points="-6,-4 0,0 -6,4"
                                                fill={getEdgeColor(edge.state)}
                                                transform={`translate(${target.x},${target.y}) rotate(${Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI})`}
                                            />
                                        )}
                                        {graphType === 'weighted' && (
                                            <text
                                                x={(source.x + target.x) / 2}
                                                y={(source.y + target.y) / 2}
                                                dy={-5}
                                                textAnchor="middle"
                                                fill={getEdgeColor(edge.state)}
                                            >
                                                {edge.weight}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {nodes.map(node => (
                            <div
                                key={node.id}
                                className="relative"
                            >
                                <div
                                    className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer text-white
                                        ${getNodeColor(node.state)}
                                        ${node.id === startNode ? 'ring-2 ring-blue-500' : ''}
                                        ${selectedNode === node.id ? 'ring-2 ring-blue-500' : ''}
                                        ${selectedNode !== null && selectedNode !== node.id ? 'hover:bg-blue-400' : ''}
                                    `}
                                    style={{ left: node.x, top: node.y }}
                                    onClick={(e) => onNodeClick(e, node.id)}
                                >
                                    {node.label}

                                    {/* Bouton de suppression */}

                                    {node.id === startNode && (
                                        <div className="absolute -top-6 text-blue-600 font-medium text-sm whitespace-nowrap">
                                            {t.messages.startNode}
                                        </div>
                                    )}
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNode(node.id);
                                        }}
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {algorithm === 'none' ? (
                                t.messages.addNodes
                            ) : !startNode ? (
                                t.messages.selectStart
                            ) : isRunning ? (
                                t.messages.running
                            ) : (
                                t.messages.readyToRun
                            )}
                        </div>
                        {graphType === 'weighted' && (
                            <div className="flex items-center gap-2 mt-2">
                                <AlertCircle className="w-4 h-4" />
                                {t.messages.weightedNote}
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <p className="text-sm font-medium mb-2">{t.legend.title}</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-slate-800"></div>
                                <span className="text-sm">{t.legend.unvisited}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">{t.legend.visiting}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <span className="text-sm">{t.legend.visited}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GraphVisualizer;
