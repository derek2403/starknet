#[starknet::contract]
mod GameState {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::Map;
    use serde::{Serde, Deserialize, Serialize};
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        game_states: Map<(ContractAddress, felt252), GameStateStruct>,
    }

    #[derive(Copy, Drop, Serde)]
    struct GameStateStruct {
        score: u32,
        move_count: u32,
        high_score: u32,
        timestamp: u64,
        grid: Array2D,
    }

    #[derive(Copy, Drop, Serde)]
    struct Array2D {
        rows: u32,
        cols: u32,
        data: Array<felt252>,
    }

    #[external(v0)]
    fn save_game_state(ref self: ContractState, game_state: GameStateStruct) {
        let caller = get_caller_address();
        self.game_states.write((caller, 'latest'.into()), game_state);
    }

    #[view(v0)]
    fn get_game_state(self: @ContractState) -> Option<GameStateStruct> {
        let caller = get_caller_address();
        self.game_states.read((caller, 'latest'.into()))
    }
}