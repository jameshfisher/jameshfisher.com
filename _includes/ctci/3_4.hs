module Hanoi where

type TowerIndex = Int
type Move = (TowerIndex,TowerIndex)
type DiskSize = Int
type Tower = [DiskSize]
type State = [Tower]

towerIndexes :: [TowerIndex]
towerIndexes = [0,1,2]

hanoi :: Int -> TowerIndex -> TowerIndex -> [Move]
hanoi 0 _ _ = []
hanoi n from to = hanoi (n-1) from spare ++ [(from, to)] ++ hanoi (n-1) spare to
  where spare = head $ filter (\t -> t /= from && t /= to) towerIndexes

---------------------------
---------- TESTS ----------

startState :: State
startState = [[1,2,3,4,5], [], []]

legalTower :: Tower -> Bool
legalTower [] = True
legalTower [d] = True
legalTower (d1:d2:ds) = d1 < d2 && legalTower (d2:ds)

legalState :: State -> Bool
legalState ts = all legalTower ts

move :: Move -> State -> State
move (i1,i2) s = map changeTower $ zip towerIndexes s where
  d = head $ s !! i1
  changeTower (i,t) 
    | i == i1   = tail t 
    | i == i2   = d:t 
    | otherwise = t

runMoves :: [Move] -> State -> [State]
runMoves moves s = foldl (\ss m -> move m (head ss) : ss) [s] moves

legalMoves :: [Move] -> State -> Bool
legalMoves moves s = all legalState $ runMoves moves s

moves :: [Move]
moves = hanoi 5 0 2

main = do
  print $ (head $ runMoves moves startState) == [[], [], [1,2,3,4,5]]
  print $ legalMoves moves startState
