import React, { useState, useReackf, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { PanGestureHandler, LongPressGestureHandler, State as GestureState } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { LegendList } from "./LegendList";

// Type for a simple item
export type DraggableItem = {
    key: string;
    label: string;
};

interface DraggableLegendListProps {
    data: DraggableItem[];
    onDragEnd?: (data: DraggableItem[]) => void;
    renderItem?: (item: DraggableItem, isActive: boolean) => React.ReactNode;
    itemHeight?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const DraggableLegendList: React.FC<DraggableLegendListProps> = ({
    data: initialData,
    onDragEnd,
    renderItem,
    itemHeight = 60,
}) => {
    const [data, setData] = useState(initialData);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const positions = useRef(data.map((_, i) => i)).current;
    const scrollY = useSharedValue(0);
    const dragY = useSharedValue(0);
    const isDragging = useRef(false);
    const listRef = useRef<any>(null);

    // Helper to move item in array
    const move = (arr: any[], from: number, to: number) => {
        const newArr = arr.slice();
        const item = newArr.splice(from, 1)[0];
        newArr.splice(to, 0, item);
        return newArr;
    };

    // Called when drag ends
    const handleDragEnd = useCallback(() => {
        if (activeIndex !== null && hoveredIndex !== null && activeIndex !== hoveredIndex) {
            const newData = move(data, activeIndex, hoveredIndex);
            setData(newData);
            onDragEnd?.(newData);
        }
        setActiveIndex(null);
        setHoveredIndex(null);
        isDragging.current = false;
    }, [activeIndex, hoveredIndex, data, onDragEnd]);

    // Render each item with gesture handlers
    const renderDraggableItem = useCallback(
        ({ item, index }: { item: DraggableItem; index: number }) => {
            const isActive = index === activeIndex;
            const isHovered = index === hoveredIndex;
            const translateY = useSharedValue(0);

            // Animated style for the dragged item
            const animatedStyle = useAnimatedStyle(() => {
                if (isActive) {
                    return {
                        zIndex: 10,
                        position: "absolute",
                        width: "100%",
                        top: dragY.value - itemHeight / 2,
                        left: 0,
                    };
                }
                return {
                    zIndex: 0,
                    position: "relative",
                    top: 0,
                    left: 0,
                };
            });

            // Gesture handlers
            const onLongPressStateChange = ({ nativeEvent }: any) => {
                if (nativeEvent.state === GestureState.ACTIVE) {
                    setActiveIndex(index);
                    setHoveredIndex(index);
                    isDragging.current = true;
                    dragY.value = index * itemHeight + itemHeight / 2;
                }
            };

            const onGestureEvent = Animated.event(
                [{ nativeEvent: { translationY: dragY } }],
                { useNativeDriver: false }
            );

            const onHandlerStateChange = ({ nativeEvent }: any) => {
                if (nativeEvent.state === GestureState.END || nativeEvent.oldState === GestureState.ACTIVE) {
                    runOnJS(handleDragEnd)();
                } else if (nativeEvent.state === GestureState.ACTIVE) {
                    // Calculate hovered index
                    const newIndex = Math.max(
                        0,
                        Math.min(
                            data.length - 1,
                            Math.floor((dragY.value - itemHeight / 2) / itemHeight)
                        )
                    );
                    if (newIndex !== hoveredIndex) {
                        runOnJS(setHoveredIndex)(newIndex);
                    }
                }
            };

            // Only render the dragged item as overlay
            if (isActive) {
                return (
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                    >
                        <Animated.View style={[{ height: itemHeight }, animatedStyle]}>
                            {renderItem ? renderItem(item, true) : (
                                <View style={[styles.item, styles.activeItem]}>
                                    <Text style={styles.itemText}>{item.label}</Text>
                                </View>
                            )}
                        </Animated.View>
                    </PanGestureHandler>
                );
            }

            // Normal item
            return (
                <LongPressGestureHandler
                    minDurationMs={300}
                    onHandlerStateChange={onLongPressStateChange}
                >
                    <Animated.View style={{ height: itemHeight, opacity: isDragging.current && hoveredIndex === index ? 0 : 1 }}>
                        {renderItem ? renderItem(item, false) : (
                            <View style={styles.item}>
                                <Text style={styles.itemText}>{item.label}</Text>
                            </View>
                        )}
                    </Animated.View>
                </LongPressGestureHandler>
            );
        },
        [activeIndex, hoveredIndex, data, itemHeight, renderItem, handleDragEnd]
    );

    // Render the list
    return (
        <View style={{ flex: 1 }}>
            <LegendList
                ref={listRef}
                data={data}
                renderItem={({ item, index }: { item: DraggableItem; index: number }) =>
                    renderDraggableItem({ item, index })
                }
                keyExtractor={(item: DraggableItem) => item.key}
                estimatedItemSize={itemHeight}
                getEstimatedItemSize={() => itemHeight}
                // Other LegendList props as needed
            />
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        height: 60,
        backgroundColor: "#4a90e2",
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
    },
    activeItem: {
        backgroundColor: "#d0021b",
    },
    itemText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "500",
    },
}); 