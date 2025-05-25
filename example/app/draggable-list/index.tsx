import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DraggableLegendList, DraggableItem } from "../../../src/DraggableLegendList";

const NUM_ITEMS = 20;
const initialData: DraggableItem[] = Array.from({ length: NUM_ITEMS }, (_, i) => ({
    key: `item-${i}`,
    label: `Item ${i + 1}`,
}));

export default function DraggableListExample() {
    const [data, setData] = useState(initialData);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Draggable List Example</Text>
            <DraggableLegendList
                data={data}
                onDragEnd={setData}
                renderItem={(item, isActive) => (
                    <View style={[styles.item, isActive && styles.activeItem]}>
                        <Text style={styles.itemText}>{item.label}</Text>
                    </View>
                )}
                itemHeight={60}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
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