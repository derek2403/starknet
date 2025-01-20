use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

#[derive(Drop, Serde)]
struct MovementSequence {
    moves: Array<felt252>,  // Store moves as strings, like chess notation
    timestamp: u64
}

#[starknet::interface]
trait IActions<TContractState> {
    fn record_moves(ref self: TContractState, moves: Array<felt252>);
}

#[dojo::contract]
mod actions {
    use super::IActions;
    use super::MovementSequence;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

    #[derive(Drop, starknet::Event)]
    enum Event {
        MovesRecorded: MovesRecorded,
    }

    #[derive(Drop, starknet::Event)]
    struct MovesRecorded {
        player: ContractAddress,
        moves: Array<felt252>,
        timestamp: u64
    }

    #[storage]
    struct Storage {
        world_dispatcher: IWorldDispatcher,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn record_moves(ref self: ContractState, moves: Array<felt252>) {
            let player = get_caller_address();
            let timestamp = get_block_timestamp();

            // Just emit the moves as an event
            self.emit(Event::MovesRecorded(MovesRecorded { 
                player, 
                moves, 
                timestamp 
            }));
        }
    }

    #[constructor]
    fn constructor(ref self: ContractState, world: IWorldDispatcher) {
        self.world_dispatcher.write(world);
    }
} 