import { View } from 'react-native';
import type { MapNode } from '../../domain/map';
import type { RunState } from '../../domain/run';
import { findNode, reachableNodeIds } from '../../logic/run';
import { eliteNote } from '../../logic/describe';
import { COLORS, MAP_LAYOUT, RADIUS } from '../../theme';
import { MapCurrentMarker } from './MapCurrentMarker';
import { MapEdge } from './MapEdge';
import type { MapLayout } from './mapLayout';
import { MapNodeView } from './MapNodeView';

const nodeRadius = (node: MapNode) => (node.type === 'boss' ? MAP_LAYOUT.bossSize : MAP_LAYOUT.nodeSize) / 2;

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
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: layout.width,
          height: layout.height,
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.mapScrim,
        }}
      />
      {run.map.nodes.flatMap((node) =>
        node.next.map((toId) => {
          const to = findNode(run.map, toId);
          const fromPos = layout.positions[node.id];
          const toPos = layout.positions[toId];
          if (!to || !fromPos || !toPos) return null;
          const fromCurrent = current?.id === node.id;
          return (
            <MapEdge
              key={`${node.id}->${toId}`}
              from={fromPos}
              to={toPos}
              fromRadius={nodeRadius(node)}
              toRadius={nodeRadius(to)}
              next={fromCurrent && reachable.has(toId)}
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
            note={node.type === 'elite' ? eliteNote(node.encounterId) : null}
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
