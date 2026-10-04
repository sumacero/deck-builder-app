import { View } from 'react-native';
import type { RunState } from '../../domain/run';
import { findNode, reachableNodeIds } from '../../logic/run';
import { MAP_LAYOUT } from '../../theme';
import { MapCurrentMarker } from './MapCurrentMarker';
import { MapEdge } from './MapEdge';
import type { MapLayout } from './mapLayout';
import { MapNodeView } from './MapNodeView';

type MapCanvasProps = {
  run: RunState;
  layout: MapLayout;
  /** ランが終わったら、どのマスも押せない。 */
  ended: boolean;
  /** 押されて移動を待っているマス。これがある間は、ほかのマスを押せない。 */
  selectedId: string | null;
  onMove: (nodeId: string) => void;
};

/** マスと道を、配置済みの座標（縦向き・横向きどちらでも）に描く。 */
export function MapCanvas({ run, layout, ended, selectedId, onMove }: MapCanvasProps) {
  const reachable = new Set(reachableNodeIds(run));
  const visited = new Set(run.visitedNodeIds);
  const current = run.currentNodeId ? findNode(run.map, run.currentNodeId) : undefined;
  const currentPosition = current ? layout.positions[current.id] : undefined;
  return (
    <View style={{ width: layout.width, height: layout.height }}>
      {run.map.nodes.flatMap((node) =>
        node.next.map((toId) => {
          const to = findNode(run.map, toId);
          const fromPos = layout.positions[node.id];
          const toPos = layout.positions[toId];
          if (!to || !fromPos || !toPos) return null;
          return (
            <MapEdge
              key={`${node.id}->${toId}`}
              from={fromPos}
              to={toPos}
              traveled={visited.has(node.id) && visited.has(toId)}
            />
          );
        }),
      )}
      {run.map.nodes.map((node) => {
        const position = layout.positions[node.id];
        if (!position) return null;
        return (
          <MapNodeView
            key={node.id}
            node={node}
            position={position}
            current={run.currentNodeId === node.id}
            reachable={!ended && selectedId === null && reachable.has(node.id)}
            visited={visited.has(node.id)}
            selected={selectedId === node.id}
            onPress={() => onMove(node.id)}
          />
        );
      })}
      {current && currentPosition && (
        <MapCurrentMarker
          position={currentPosition}
          nodeSize={current.type === 'boss' ? MAP_LAYOUT.bossSize : MAP_LAYOUT.nodeSize}
          icon={run.agent.icon}
        />
      )}
    </View>
  );
}
