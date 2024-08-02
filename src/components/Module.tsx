import React from 'react';
import { Box } from '@mui/material';
import { useDrag, useDragDropManager } from 'react-dnd';
import { useRafLoop } from 'react-use';

import ModuleInterface from '../types/ModuleInterface';
import { moduleW2LocalWidth, moduleX2LocalX, moduleY2LocalY } from '../helpers';

type ModuleProps = {
  data: ModuleInterface,
  containerWidth:number,
  setModules:any
};

const Module = (props: ModuleProps) => {
  const { data: { id, coord: { x, y, w, h } },containerWidth,setModules } = props;

  console.log('data',props.data);
  
  // Transform x, y to left, top
  const [{ top, left }, setPosition] = React.useState(() => ({
    top: moduleY2LocalY(y),
    left: moduleX2LocalX(x),
  }));

  console.log('top',top);



  //console.log('my-t',top, left);

  const dndManager = useDragDropManager();
  const initialPosition = React.useRef<{ top: number; left: number }>();

  // Use request animation frame to process dragging
  const [stop, start] = useRafLoop(() => {
    const movement = dndManager.getMonitor().getDifferenceFromInitialOffset();

    if (!initialPosition.current || !movement) {
      return;
    }
    
    //&& (containerWidth - initialPosition.current.left + movement.x) <= 244
    // Update new position of the module
    if(initialPosition.current.left + movement.x >= 0 && initialPosition.current.top + movement.y >= 0 && (initialPosition.current.left + movement.x+moduleW2LocalWidth(w)) < containerWidth ){
    setPosition({
      top: initialPosition.current.top + movement.y,
      left: initialPosition.current.left + movement.x,
    });
    
    ///set the height
    updateModule()
    ///
    }
    /*
    else if((containerWidth - initialPosition.current.left + movement.x) <= moduleW2LocalWidth(w)){
        setPosition({
  
      left: containerWidth-moduleW2LocalWidth(w),
    });
    }
    */
  }, false);

  //update module my
  const updateModule = () => {
      setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === props.data.id
          ? { ...module, coord: { ...module.coord, y: top } }
          : module
      )
    );
  };
  ////
  // Wire the module to DnD drag system
  const [, drag] = useDrag(() => ({
    type: 'module',
    item: () => {
      // Track the initial position at the beginning of the drag operation

      initialPosition.current = { top, left };

      // Start raf
      start();
      return { id };
    },
    end: stop,
  }), [top, left]);

  return (
    <Box
      ref={drag}
      display="flex"
      position="absolute"
      border={1}
      borderColor="grey.500"
      padding="10px"
      bgcolor="rgba(0, 0, 0, 0.5)"
      top={top}
      left={left}
      width={moduleW2LocalWidth(w)}
      height={h}
      sx={{
        transitionProperty: 'top, left',
        transitionDuration: '0.1s',
        '& .resizer': {
          opacity: 0,
        },
        '&:hover .resizer': {
          opacity: 1,
        },
      }}
    >
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={40}
        color="#fff"
        sx={{ cursor: 'move' }}
        draggable
      >
        <Box sx={{ userSelect: 'none', pointerEvents: 'none' }}>{id}</Box>
      </Box>
    </Box>
  );
};

export default React.memo(Module);
