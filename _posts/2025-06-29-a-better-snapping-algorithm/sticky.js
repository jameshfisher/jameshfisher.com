"use strict";
// Constants
const CANVAS_SIZE = 1000;
const WINDOW_WIDTH = 0.6;
const WINDOW_HEIGHT = 0.45;
const SNAP_THRESHOLD = 0.1;
// Global state
let state = {
    dragging: false,
    windowPosition: { left: -0.3, top: -0.225 }
};
const getSnapLines = () => {
    return {
        vertical: [0],
        horizontal: [0]
    };
};
const updateSnapState = (draggedLeft, draggedTop, currentSnapState, previousLeft, previousTop) => {
    const snapLines = getSnapLines();
    // Check X-axis snapping (vertical lines)
    let newXAxis = currentSnapState.xAxis;
    if (currentSnapState.xAxis.type === 'Free') {
        // Check for collisions with vertical snap lines
        for (const line of snapLines.vertical) {
            const prevLeft = previousLeft;
            const currentLeft = draggedLeft;
            const prevRight = previousLeft + WINDOW_WIDTH;
            const currentRight = draggedLeft + WINDOW_WIDTH;
            const prevCenter = previousLeft + WINDOW_WIDTH / 2;
            const currentCenter = draggedLeft + WINDOW_WIDTH / 2;
            // Check left edge collision
            if ((prevLeft <= line && currentLeft > line) || (prevLeft >= line && currentLeft < line)) {
                newXAxis = { type: 'Stuck', edge: 'Start' };
                break;
            }
            // Check right edge collision
            if ((prevRight <= line && currentRight > line) || (prevRight >= line && currentRight < line)) {
                newXAxis = { type: 'Stuck', edge: 'End' };
                break;
            }
            // Check center collision
            if ((prevCenter <= line && currentCenter > line) || (prevCenter >= line && currentCenter < line)) {
                newXAxis = { type: 'Stuck', edge: 'Middle' };
                break;
            }
        }
    }
    else {
        // Check if we should unsnap from X-axis
        const snapLine = getSnapLineForAxis(draggedLeft, currentSnapState.xAxis, true);
        if (snapLine !== null) {
            const distance = getDistanceToSnapLine(draggedLeft, currentSnapState.xAxis, snapLine, true);
            if (distance > SNAP_THRESHOLD) {
                newXAxis = { type: 'Free' };
            }
        }
    }
    // Check Y-axis snapping (horizontal lines)
    let newYAxis = currentSnapState.yAxis;
    if (currentSnapState.yAxis.type === 'Free') {
        // Check for collisions with horizontal snap lines
        for (const line of snapLines.horizontal) {
            const prevTop = previousTop;
            const currentTop = draggedTop;
            const prevBottom = previousTop + WINDOW_HEIGHT;
            const currentBottom = draggedTop + WINDOW_HEIGHT;
            const prevCenter = previousTop + WINDOW_HEIGHT / 2;
            const currentCenter = draggedTop + WINDOW_HEIGHT / 2;
            // Check top edge collision
            if ((prevTop <= line && currentTop > line) || (prevTop >= line && currentTop < line)) {
                newYAxis = { type: 'Stuck', edge: 'Start' };
                break;
            }
            // Check bottom edge collision
            if ((prevBottom <= line && currentBottom > line) || (prevBottom >= line && currentBottom < line)) {
                newYAxis = { type: 'Stuck', edge: 'End' };
                break;
            }
            // Check center collision
            if ((prevCenter <= line && currentCenter > line) || (prevCenter >= line && currentCenter < line)) {
                newYAxis = { type: 'Stuck', edge: 'Middle' };
                break;
            }
        }
    }
    else {
        // Check if we should unsnap from Y-axis
        const snapLine = getSnapLineForAxis(draggedTop, currentSnapState.yAxis, false);
        if (snapLine !== null) {
            const distance = getDistanceToSnapLine(draggedTop, currentSnapState.yAxis, snapLine, false);
            if (distance > SNAP_THRESHOLD) {
                newYAxis = { type: 'Free' };
            }
        }
    }
    return {
        xAxis: newXAxis,
        yAxis: newYAxis
    };
};
const getSnapLineForAxis = (position, axis, isVertical = true) => {
    if (axis.type === 'Free')
        return null;
    const snapLines = getSnapLines();
    const lines = isVertical ? snapLines.vertical : snapLines.horizontal;
    // Find the closest snap line based on the edge type
    let closestLine = null;
    let minDistance = Infinity;
    for (const line of lines) {
        let distance;
        if (axis.edge === 'Start') {
            distance = Math.abs(position - line);
        }
        else if (axis.edge === 'End') {
            const windowSize = isVertical ? WINDOW_WIDTH : WINDOW_HEIGHT;
            distance = Math.abs((position + windowSize) - line);
        }
        else { // Middle
            const windowSize = isVertical ? WINDOW_WIDTH : WINDOW_HEIGHT;
            distance = Math.abs((position + windowSize / 2) - line);
        }
        if (distance < minDistance) {
            minDistance = distance;
            closestLine = line;
        }
    }
    return closestLine;
};
const getDistanceToSnapLine = (position, axis, snapLine, isVertical = true) => {
    if (axis.type === 'Free')
        return Infinity;
    if (axis.edge === 'Start') {
        return Math.abs(position - snapLine);
    }
    else if (axis.edge === 'End') {
        const windowSize = isVertical ? WINDOW_WIDTH : WINDOW_HEIGHT;
        return Math.abs((position + windowSize) - snapLine);
    }
    else { // Middle
        const windowSize = isVertical ? WINDOW_WIDTH : WINDOW_HEIGHT;
        return Math.abs((position + windowSize / 2) - snapLine);
    }
};
const calculateSnappedPosition = (draggedLeft, draggedTop, snapState) => {
    const snapLines = getSnapLines();
    let snappedLeft = draggedLeft;
    let snappedTop = draggedTop;
    // Snap X-axis if stuck
    if (snapState.xAxis.type === 'Stuck') {
        const closestVerticalLine = getSnapLineForAxis(draggedLeft, snapState.xAxis, true);
        if (closestVerticalLine !== null) {
            if (snapState.xAxis.edge === 'Start') {
                snappedLeft = closestVerticalLine;
            }
            else if (snapState.xAxis.edge === 'End') {
                snappedLeft = closestVerticalLine - WINDOW_WIDTH;
            }
            else { // Middle
                snappedLeft = closestVerticalLine - WINDOW_WIDTH / 2;
            }
        }
    }
    // Snap Y-axis if stuck
    if (snapState.yAxis.type === 'Stuck') {
        const closestHorizontalLine = getSnapLineForAxis(draggedTop, snapState.yAxis, false);
        if (closestHorizontalLine !== null) {
            if (snapState.yAxis.edge === 'Start') {
                snappedTop = closestHorizontalLine;
            }
            else if (snapState.yAxis.edge === 'End') {
                snappedTop = closestHorizontalLine - WINDOW_HEIGHT;
            }
            else { // Middle
                snappedTop = closestHorizontalLine - WINDOW_HEIGHT / 2;
            }
        }
    }
    return { left: snappedLeft, top: snappedTop };
};
// Coordinate conversion functions
const worldToScreen = (worldX, worldY) => {
    return {
        x: ((worldX + 1) / 2) * CANVAS_SIZE,
        y: ((worldY + 1) / 2) * CANVAS_SIZE
    };
};
const screenToWorld = (screenX, screenY) => {
    return {
        x: (screenX / CANVAS_SIZE) * 2 - 1,
        y: (screenY / CANVAS_SIZE) * 2 - 1
    };
};
// Drawing functions
const drawBackground = (ctx) => {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};
const drawSnapLines = (ctx) => {
    const snapLines = getSnapLines();
    // Draw vertical snap lines
    snapLines.vertical.forEach((worldX) => {
        const { x } = worldToScreen(worldX, 0);
        const isSnapped = state.dragging && state.axisStates.xAxis.type === 'Stuck';
        ctx.strokeStyle = isSnapped ? 'rgba(100, 116, 139, 0.6)' : 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
    });
    // Draw horizontal snap lines
    snapLines.horizontal.forEach((worldY) => {
        const { y } = worldToScreen(0, worldY);
        const isSnapped = state.dragging && state.axisStates.yAxis.type === 'Stuck';
        ctx.strokeStyle = isSnapped ? 'rgba(100, 116, 139, 0.6)' : 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
    });
};
const drawWindow = (ctx, left, top, windowType) => {
    const topLeft = worldToScreen(left, top);
    const bottomRight = worldToScreen(left + WINDOW_WIDTH, top + WINDOW_HEIGHT);
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    const cornerRadius = 8;
    // Set colors for different window types
    let fillStyle;
    if (windowType === 'dragged') {
        fillStyle = 'rgba(128, 128, 128, 0.3)'; // 30% grey for live drag position
    }
    else {
        fillStyle = 'rgba(0, 128, 0, 0.6)'; // 60% green for actual window (original/snapped)
    }
    ctx.fillStyle = fillStyle;
    // Draw rounded rectangle without border
    ctx.beginPath();
    ctx.moveTo(topLeft.x + cornerRadius, topLeft.y);
    ctx.lineTo(topLeft.x + width - cornerRadius, topLeft.y);
    ctx.quadraticCurveTo(topLeft.x + width, topLeft.y, topLeft.x + width, topLeft.y + cornerRadius);
    ctx.lineTo(topLeft.x + width, topLeft.y + height - cornerRadius);
    ctx.quadraticCurveTo(topLeft.x + width, topLeft.y + height, topLeft.x + width - cornerRadius, topLeft.y + height);
    ctx.lineTo(topLeft.x + cornerRadius, topLeft.y + height);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y + height, topLeft.x, topLeft.y + height - cornerRadius);
    ctx.lineTo(topLeft.x, topLeft.y + cornerRadius);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + cornerRadius, topLeft.y);
    ctx.closePath();
    ctx.fill();
};
const drawTargetWindows = (ctx) => {
    const targetB = {
        left: 0.05,
        top: -0.05 - WINDOW_HEIGHT
    };
    const targets = [
        { position: targetB, label: 'Drag here!' }
    ];
    targets.forEach(({ position, label }) => {
        const topLeft = worldToScreen(position.left, position.top);
        const bottomRight = worldToScreen(position.left + WINDOW_WIDTH, position.top + WINDOW_HEIGHT);
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        const cornerRadius = 8;
        // Draw dotted border
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(topLeft.x + cornerRadius, topLeft.y);
        ctx.lineTo(topLeft.x + width - cornerRadius, topLeft.y);
        ctx.quadraticCurveTo(topLeft.x + width, topLeft.y, topLeft.x + width, topLeft.y + cornerRadius);
        ctx.lineTo(topLeft.x + width, topLeft.y + height - cornerRadius);
        ctx.quadraticCurveTo(topLeft.x + width, topLeft.y + height, topLeft.x + width - cornerRadius, topLeft.y + height);
        ctx.lineTo(topLeft.x + cornerRadius, topLeft.y + height);
        ctx.quadraticCurveTo(topLeft.x, topLeft.y + height, topLeft.x, topLeft.y + height - cornerRadius);
        ctx.lineTo(topLeft.x, topLeft.y + cornerRadius);
        ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + cornerRadius, topLeft.y);
        ctx.closePath();
        ctx.stroke();
        // Reset line dash
        ctx.setLineDash([]);
        // Draw label
        ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, topLeft.x + width / 2, topLeft.y + height / 2);
    });
};
// Main drawing function
const draw = () => {
    const canvas = document.getElementById('sticky-snap-app');
    const ctx = canvas?.getContext('2d');
    if (!ctx)
        return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawBackground(ctx);
    drawSnapLines(ctx);
    drawTargetWindows(ctx);
    if (state.dragging) {
        // While dragging: show green window at snapped position and grey window at dragged position
        const draggedPosition = {
            left: state.windowPosition.left + state.dragOffsetX,
            top: state.windowPosition.top + state.dragOffsetY
        };
        const snappedPosition = calculateSnappedPosition(draggedPosition.left, draggedPosition.top, state.axisStates);
        drawWindow(ctx, snappedPosition.left, snappedPosition.top, 'snapped');
        drawWindow(ctx, draggedPosition.left, draggedPosition.top, 'dragged');
    }
    else {
        // When not dragging: show only the green window at its actual position
        drawWindow(ctx, state.windowPosition.left, state.windowPosition.top, 'original');
    }
};
// Mouse event handlers
const getMousePos = (e) => {
    const canvas = document.getElementById('sticky-snap-app');
    if (!canvas)
        return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Scale from actual rendered size to internal canvas size (1000px)
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
};
const handleMouseDown = (e) => {
    const mousePos = getMousePos(e);
    const worldPos = screenToWorld(mousePos.x, mousePos.y);
    // Check if mouse is within the window bounds
    const withinX = worldPos.x >= state.windowPosition.left && worldPos.x <= state.windowPosition.left + WINDOW_WIDTH;
    const withinY = worldPos.y >= state.windowPosition.top && worldPos.y <= state.windowPosition.top + WINDOW_HEIGHT;
    if (withinX && withinY) {
        state = {
            dragging: true,
            windowPosition: state.windowPosition,
            dragStartX: worldPos.x,
            dragStartY: worldPos.y,
            dragOffsetX: 0,
            dragOffsetY: 0,
            axisStates: { xAxis: { type: 'Free' }, yAxis: { type: 'Free' } },
            previousDraggedPosition: state.windowPosition
        };
        draw();
    }
};
const handleMouseMove = (e) => {
    if (!state.dragging)
        return;
    const mousePos = getMousePos(e);
    const worldPos = screenToWorld(mousePos.x, mousePos.y);
    const newDragOffsetX = worldPos.x - state.dragStartX;
    const newDragOffsetY = worldPos.y - state.dragStartY;
    const draggedLeft = state.windowPosition.left + newDragOffsetX;
    const draggedTop = state.windowPosition.top + newDragOffsetY;
    const newSnapState = updateSnapState(draggedLeft, draggedTop, state.axisStates, state.previousDraggedPosition.left, state.previousDraggedPosition.top);
    state = {
        ...state,
        dragOffsetX: newDragOffsetX,
        dragOffsetY: newDragOffsetY,
        axisStates: newSnapState,
        previousDraggedPosition: { left: draggedLeft, top: draggedTop }
    };
    draw();
};
const handleMouseUp = () => {
    if (!state.dragging)
        return;
    const draggedPosition = {
        left: state.windowPosition.left + state.dragOffsetX,
        top: state.windowPosition.top + state.dragOffsetY
    };
    const snappedPosition = calculateSnappedPosition(draggedPosition.left, draggedPosition.top, state.axisStates);
    state = {
        dragging: false,
        windowPosition: snappedPosition
    };
    draw();
};
// Initialize the app
const init = () => {
    const canvas = document.getElementById('sticky-snap-app');
    if (!canvas)
        return;
    // Set canvas size and style
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.style.maxWidth = '500px';
    canvas.style.maxHeight = '500px';
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = '1';
    canvas.style.cursor = 'grab';
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // Initial draw
    draw();
};
// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
