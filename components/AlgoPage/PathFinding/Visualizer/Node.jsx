import React from 'react';

export default function Node(props) {
	const {
		x, y,
		width,
		height,
		isWall,
		isStart,
		isFinish,
		onMouseDown,
		onMouseEnter,
		onMouseUp,
	} = props;

	const extraClassName = isFinish
		? 'node-finish'
		: isStart
			? 'node-start'
			: isWall
				? 'node-wall'
				: '';

	return (
		<div
			id={`node-${x}-${y}`}
			className={`node ${extraClassName}`}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				border: `1px solid green`,
				display: 'inline-block',
			}}
			onMouseDown={() => onMouseDown(x, y)}
			onMouseEnter={() => onMouseEnter(x, y)}
			onMouseUp={() => onMouseUp()}>
		</div>
	);
}
